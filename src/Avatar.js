import * as THREE from "three";

/**
 * Avatar - Represents a remote player in 3D space
 * 
 * Usage:
 *   const avatar = new Avatar(userId, username, color, scene);
 *   avatar.updatePose(hmdPosition, hmdRotation, leftControllerMatrix, rightControllerMatrix);
 *   avatar.dispose();
 */

class Avatar {
    constructor(clientId, username, color, scene) {
        this.clientId = clientId;
        this.username = username;
        this.color = color;
        this.scene = scene;

        // Create Three.js Group to hold all avatar parts
        this.group = new THREE.Group();
        this.group.name = `avatar-${clientId}`;
        scene.add(this.group);

        // Create head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.8,
        });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.set(0, 0, 0);
        this.group.add(this.head);

        // Add username label above head
        const canvas = this.createTextCanvas(username, 256, 64);
        const texture = new THREE.CanvasTexture(canvas);
        const labelGeometry = new THREE.PlaneGeometry(0.3, 0.075);
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
        });
        this.label = new THREE.Mesh(labelGeometry, labelMaterial);
        this.label.position.set(0, 0.15, 0);
        this.group.add(this.label);

        // Create left controller (box)
        const controllerGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.15);
        const controllerMaterial = new THREE.MeshStandardMaterial({
            color: 0xff8800,
            metalness: 0.5,
            roughness: 0.7,
        });
        this.leftHand = new THREE.Mesh(controllerGeometry, controllerMaterial);
        this.group.add(this.leftHand);

        // Create right controller (box)
        this.rightHand = new THREE.Mesh(controllerGeometry, controllerMaterial);
        this.group.add(this.rightHand);

        // Matrix helpers
        this.matrix4 = new THREE.Matrix4();
        this.quaternion = new THREE.Quaternion();
        this.position = new THREE.Vector3();
    }

    /**
     * Update avatar pose from network data
     * 
     * @param {Array<number>} hmdPosition - [x, y, z]
     * @param {Array<number>} hmdRotation - [x, y, z, w] (quaternion)
     * @param {Array<number>} leftControllerMatrix - 16-element matrix array
     * @param {Array<number>} rightControllerMatrix - 16-element matrix array
     */
    updatePose(hmdPosition, hmdRotation, leftControllerMatrix, rightControllerMatrix) {
        // Update head position and rotation
        this.head.position.set(hmdPosition[0], hmdPosition[1], hmdPosition[2]);
        this.head.quaternion.set(hmdRotation[0], hmdRotation[1], hmdRotation[2], hmdRotation[3]);

        // Keep label attached to head
        this.label.position.copy(this.head.position);
        this.label.position.y += 0.15;

        // Update left controller from matrix
        if (leftControllerMatrix && leftControllerMatrix.length === 16) {
            this.matrix4.fromArray(leftControllerMatrix);
            this.matrix4.decompose(this.position, this.quaternion, new THREE.Vector3());
            this.leftHand.position.copy(this.position);
            this.leftHand.quaternion.copy(this.quaternion);
        }

        // Update right controller from matrix
        if (rightControllerMatrix && rightControllerMatrix.length === 16) {
            this.matrix4.fromArray(rightControllerMatrix);
            this.matrix4.decompose(this.position, this.quaternion, new THREE.Vector3());
            this.rightHand.position.copy(this.position);
            this.rightHand.quaternion.copy(this.quaternion);
        }
    }

    /**
     * Create a canvas texture with text for username
     */
    createTextCanvas(text, width = 256, height = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);

        return canvas;
    }

    /**
     * Remove avatar from scene and clean up resources
     */
    dispose() {
        // Dispose geometries
        this.head.geometry.dispose();
        this.head.material.dispose();

        this.leftHand.geometry.dispose();
        this.leftHand.material.dispose();

        this.rightHand.geometry.dispose();
        this.rightHand.material.dispose();

        this.label.geometry.dispose();
        if (this.label.material.map) {
            this.label.material.map.dispose();
        }
        this.label.material.dispose();

        // Remove from scene
        this.scene.remove(this.group);
    }

    /**
     * Get the Three.js group for this avatar
     */
    getGroup() {
        return this.group;
    }

    /**
     * Get the head mesh
     */
    getHead() {
        return this.head;
    }
}

export default Avatar;
