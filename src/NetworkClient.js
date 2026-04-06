/**
 * NetworkClient - Handles WebSocket connection and pose synchronization
 * 
 * Usage:
 *   const network = new NetworkClient('http://localhost:8080', 'PlayerName');
 *   
 *   network.on('user-joined', (user) => { console.log(user.username); });
 *   network.on('user-left', (clientId) => { console.log('User left:', clientId); });
 *   network.on('pose-update', (data) => { updateRemoteAvatar(data); });
 *   
 *   // On every frame:
 *   network.sendPose(camera, leftController, rightController);
 */

class NetworkClient {
    constructor(serverUrl = 'ws://localhost:8080', username = 'Player') {
        this.serverUrl = serverUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        this.username = username;
        this.ws = null;
        this.clientId = null;
        this.color = null;
        this.remoteUsers = new Map(); // Map<clientId, { username, color, pose }>
        this.listeners = new Map(); // Map<eventType, Set<callbacks>>
        this.poseThrottle = 10; // ms - 10Hz update rate
        this.lastPoseSentTime = 0;
        this.isConnected = false;

        this.connect();
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        try {
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = () => {
                console.log('[NetworkClient] Connected to server:', this.serverUrl);
                this.isConnected = true;

                // Send join message
                this.send({
                    type: 'user-join',
                    username: this.username,
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('[NetworkClient] Failed to parse message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[NetworkClient] WebSocket error:', error);
                this.isConnected = false;
            };

            this.ws.onclose = () => {
                console.log('[NetworkClient] Disconnected from server');
                this.isConnected = false;
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.connect(), 3000);
            };
        } catch (error) {
            console.error('[NetworkClient] Connection error:', error);
            setTimeout(() => this.connect(), 3000);
        }
    }

    /**
     * Route incoming messages
     */
    handleMessage(message) {
        const { type } = message;

        switch (type) {
            case 'user-assigned':
                this.clientId = message.clientId;
                this.color = message.color;
                console.log(
                    `[NetworkClient] Assigned client ID: ${this.clientId}, color: #${this.color.toString(16).padStart(6, '0')}`
                );
                this.emit('connected', { clientId: this.clientId, color: this.color });
                break;

            case 'user-list':
                // Server sends list of existing users when we join
                message.users.forEach((user) => {
                    this.remoteUsers.set(user.clientId, user);
                    this.emit('user-joined', user);
                });
                break;

            case 'user-connected':
                // New user joined (broadcasted to existing users)
                this.remoteUsers.set(message.clientId, {
                    clientId: message.clientId,
                    username: message.username,
                    color: message.color,
                    pose: {
                        hmdPosition: [0, 0, 0],
                        hmdRotation: [0, 0, 0, 1],
                        leftControllerMatrix: new Array(16).fill(0),
                        rightControllerMatrix: new Array(16).fill(0),
                    },
                });
                console.log(`[NetworkClient] User "${message.username}" joined`);
                this.emit('user-joined', {
                    clientId: message.clientId,
                    username: message.username,
                    color: message.color,
                });
                break;

            case 'user-disconnected':
                const disconnectedUser = this.remoteUsers.get(message.clientId);
                if (disconnectedUser) {
                    console.log(`[NetworkClient] User "${disconnectedUser.username}" left`);
                }
                this.remoteUsers.delete(message.clientId);
                this.emit('user-left', message.clientId);
                break;

            case 'remote-pose':
                // Update remote user's pose
                let user = this.remoteUsers.get(message.clientId);
                if (!user) {
                    user = {
                        clientId: message.clientId,
                        username: `User-${message.clientId}`,
                        color: 0xffffff,
                        pose: null,
                    };
                    this.remoteUsers.set(message.clientId, user);
                    this.emit("user-joined", user);
                }

                user.pose = {
                    hmdPosition: message.hmdPosition,
                    hmdRotation: message.hmdRotation,
                    leftControllerMatrix: message.leftControllerMatrix,
                    rightControllerMatrix: message.rightControllerMatrix,
                };

                this.emit("pose-update", {
                    clientId: message.clientId,
                    ...user.pose,
                });
                break;

            case 'error':
                console.error('[NetworkClient] Server error:', message.message);
                this.emit('error', message);
                break;

            default:
                console.warn(`[NetworkClient] Unknown message type: ${type}`);
        }
    }

    /**
     * Send a raw message to server
     */
    send(message) {
        if (this.ws && this.isConnected) {
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('[NetworkClient] Failed to send message:', error);
            }
        }
    }

    /**
     * Send local player's pose (camera + controllers)
     * Throttled to ~10Hz (100ms)
     * 
     * @param {THREE.Camera} camera - Local player's HMD/camera
     * @param {THREE.Object3D} leftController - Left controller object
     * @param {THREE.Object3D} rightController - Right controller object
     */
    sendPose(camera, leftController, rightController) {
        const now = Date.now();
        if (now - this.lastPoseSentTime < this.poseThrottle) {
            return;
        }

        this.lastPoseSentTime = now;

        // Ensure world matrices are current before extracting pose
        camera.updateMatrixWorld(true);
        leftController.updateMatrixWorld(true);
        rightController.updateMatrixWorld(true);

        // Read HMD pose from world matrix (works for desktop and XR camera)
        const hmdPos = { x: 0, y: 0, z: 0 };
        const hmdQuat = { x: 0, y: 0, z: 0, w: 1 };
        const tempScale = { x: 1, y: 1, z: 1 };

        const _pos = new Float32Array(3);
        const _quat = new Float32Array(4);

        // Decompose matrixWorld using THREE-style arrays
        const m = camera.matrixWorld.elements;
        _pos[0] = m[12]; _pos[1] = m[13]; _pos[2] = m[14];

        // Quaternion from matrix (minimal robust extraction)
        const trace = m[0] + m[5] + m[10];
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            _quat[3] = 0.25 / s;
            _quat[0] = (m[6] - m[9]) * s;
            _quat[1] = (m[8] - m[2]) * s;
            _quat[2] = (m[1] - m[4]) * s;
        } else if (m[0] > m[5] && m[0] > m[10]) {
            const s = 2.0 * Math.sqrt(1.0 + m[0] - m[5] - m[10]);
            _quat[3] = (m[6] - m[9]) / s;
            _quat[0] = 0.25 * s;
            _quat[1] = (m[4] + m[1]) / s;
            _quat[2] = (m[8] + m[2]) / s;
        } else if (m[5] > m[10]) {
            const s = 2.0 * Math.sqrt(1.0 + m[5] - m[0] - m[10]);
            _quat[3] = (m[8] - m[2]) / s;
            _quat[0] = (m[4] + m[1]) / s;
            _quat[1] = 0.25 * s;
            _quat[2] = (m[9] + m[6]) / s;
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m[10] - m[0] - m[5]);
            _quat[3] = (m[1] - m[4]) / s;
            _quat[0] = (m[8] + m[2]) / s;
            _quat[1] = (m[9] + m[6]) / s;
            _quat[2] = 0.25 * s;
        }

        const hmdPosition = [_pos[0], _pos[1], _pos[2]];
        const hmdRotation = [_quat[0], _quat[1], _quat[2], _quat[3]];

        // Send controllers in world space
        const leftControllerMatrix = this.matrix4ToArray(leftController.matrixWorld);
        const rightControllerMatrix = this.matrix4ToArray(rightController.matrixWorld);

        this.send({
            type: "pose-update",
            hmdPosition,
            hmdRotation,
            leftControllerMatrix,
            rightControllerMatrix,
        });
    }

    /**
     * Convert Three.js Matrix4 to array [16 elements]
     */
    matrix4ToArray(matrix) {
        return matrix.elements.slice();
    }

    /**
     * Convert array [16 elements] to Three.js Matrix4
     */
    arrayToMatrix4(array) {
        const matrix = new window.THREE.Matrix4();
        matrix.fromArray(array);
        return matrix;
    }

    /**
     * Get information about a remote user
     */
    getRemoteUser(clientId) {
        return this.remoteUsers.get(clientId);
    }

    /**
     * Get all remote users
     */
    getAllRemoteUsers() {
        return Array.from(this.remoteUsers.values());
    }

    /**
     * Event emitter methods
     */
    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);
    }

    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).delete(callback);
        }
    }

    emit(eventType, data) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[NetworkClient] Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.isConnected = false;
        }
    }
}

export default NetworkClient;
