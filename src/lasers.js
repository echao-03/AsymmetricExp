import * as THREE from "three";

export class Laser {
    constructor(scene, name, width, height, depth, x, y, z, active, listener, buffer) {
        this.laserId = name;
        this.x = x;
        this.y = y;
        this.z = z;

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshBasicMaterial({
                color: "red",
                opacity: 0.3,
                transparent: "true",
            }),
        );

        this.mesh.position.set(x, y, z);
        this.mesh.rotateY(Math.PI / 2);
        this.mesh.visible = active;
        scene.add(this.mesh);

        // Adding audio to lasers
        this.laserSound = new THREE.PositionalAudio(listener);

        this.mesh.add(this.laserSound);

        this.laserSound.setBuffer(buffer);
        this.laserSound.setRefDistance(1);
        this.laserSound.setMaxDistance(3);
        this.laserSound.setDistanceModel("linear");

        if (active) {
            this.laserSound.play();
        }
    }

    setLasersActive(isActive) {
        this.mesh.visible = isActive;
        if (!isActive) {
            this.laserSound.stop();
        }
    }

}