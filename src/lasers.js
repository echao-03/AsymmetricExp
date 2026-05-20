import * as THREE from "three";

export class Laser {
    constructor(scene, name, width, height, depth, x, y, z, active) {
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
    }

    setLasersActive(isActive) {
        this.mesh.visible = isActive;
    }

}