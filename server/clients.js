/**
 * Client connection management for multiplayer server
 */

class ClientManager {
    constructor() {
        this.clients = new Map(); // Map<clientId, { ws, username, color, userId, pose }>
        this.nextClientId = 0;
        this.colors = [
            0xff0000, // red
            0x00ff00, // green
            0x0000ff, // blue
            0xffff00, // yellow
            0xff00ff, // magenta
            0x00ffff, // cyan
            0xff8800, // orange
            0xff0088, // pink
        ];
    }

    /**
     * Register a new connected client
     * @param {WebSocket} ws - WebSocket connection
     * @param {string} username - Player username
     * @returns {Object} - { clientId, color }
     */
    addClient(ws, username) {
        const clientId = this.nextClientId++;
        const color = this.colors[clientId % this.colors.length];

        this.clients.set(clientId, {
            ws,
            username,
            clientId,
            color,
            pose: {
                hmdPosition: [0, 0, 0],
                hmdRotation: [0, 0, 0, 1],
                leftControllerMatrix: new Array(16).fill(0),
                rightControllerMatrix: new Array(16).fill(0),
            },

            // todo: need to add states for lasers and rightroom's tile states 

        });

        return { clientId, color };
    }

    /**
     * Remove a disconnected client
     * @param {number} clientId
     */
    removeClient(clientId) {
        this.clients.delete(clientId);
    }

    /**
     * Update a client's pose data
     * @param {number} clientId
     * @param {Object} pose - { hmdPosition, hmdRotation, leftControllerMatrix, rightControllerMatrix }
     */
    updatePose(clientId, pose) {
        const client = this.clients.get(clientId);
        if (client) {
            client.pose = pose;
        }
    }

    /**
     * Get all clients except the given one
     * @param {number} excludeClientId
     * @returns {Array} - Array of client objects
     */
    getOtherClients(excludeClientId) {
        return Array.from(this.clients.values()).filter(
            (c) => c.clientId !== excludeClientId
        );
    }

    /**
     * Get a specific client
     * @param {number} clientId
     * @returns {Object|undefined}
     */
    getClient(clientId) {
        return this.clients.get(clientId);
    }

    /**
     * Get all clients
     * @returns {Array}
     */
    getAllClients() {
        return Array.from(this.clients.values());
    }

    /**
     * Broadcast a message to all clients
     * @param {Object} message
     */
    broadcastToAll(message) {
        const data = JSON.stringify(message);
        this.clients.forEach((client) => {
            if (client.ws.readyState === 1) {
                // WebSocket.OPEN
                client.ws.send(data);
            }
        });
    }

    /**
     * Broadcast a message to all clients except sender
     * @param {number} senderClientId
     * @param {Object} message
     */
    broadcastToOthers(senderClientId, message) {
        const data = JSON.stringify(message);
        this.clients.forEach((client) => {
            if (
                client.clientId !== senderClientId &&
                client.ws.readyState === 1
            ) {
                client.ws.send(data);
            }
        });
    }

    /**
     * Send a message to a specific client
     * @param {number} clientId
     * @param {Object} message
     */
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify(message));
        }
    }
}

export default ClientManager;
