import * as THREE from "three";

export function createMap(scene) {
    const floorGeometry = new THREE.BoxGeometry(20, 0.5, 25);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: "gray",
        roughness: 0.35,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    const wallMaterial = new THREE.MeshStandardMaterial({
        color: "rgb(64, 64, 64)",
        roughness: 0.35,
        metalness: 0.1
    });

    const wallGeometries = {
        long: new THREE.BoxGeometry(0.5, 2, 10),
        short: new THREE.BoxGeometry(0.5, 2, 5),
        roomShort: new THREE.BoxGeometry(0.5, 2, 3),
        roomLong: new THREE.BoxGeometry(0.5, 2, 4),
        roomLonger: new THREE.BoxGeometry(0.5, 2, 10),
    };

    const wallSpecs = [
        { geo: "long", x: -1.5, z: 6 },
        { geo: "long", x: 1.5, z: 6 },
        { geo: "long", x: -1.5, z: -6 },
        { geo: "long", x: 1.5, z: -6 },

        { geo: "short", x: 4, z: -1.5, ry: Math.PI / 2 },
        { geo: "short", x: 4, z: 1.5, ry: Math.PI / 2 },
        { geo: "short", x: -4, z: -1.5, ry: Math.PI / 2 },
        { geo: "short", x: -4, z: 1.5, ry: Math.PI / 2 },

        { geo: "short", x: 0, z: 11, ry: Math.PI / 2 },
        { geo: "short", x: 0, z: -11, ry: Math.PI / 2 },

        { geo: "roomLong", x: 6.5, z: -3 },
        { geo: "roomLong", x: 6.5, z: 3 },
        { geo: "roomShort", x: 8, z: 5, ry: Math.PI / 2 },
        { geo: "roomShort", x: 8, z: -5, ry: Math.PI / 2 },
        { geo: "roomLonger", x: 9.5, z: 0 },

        { geo: "roomLong", x: -6.5, z: -3 },
        { geo: "roomLong", x: -6.5, z: 3 },
        { geo: "roomShort", x: -8, z: 5, ry: Math.PI / 2 },
        { geo: "roomShort", x: -8, z: -5, ry: Math.PI / 2 },
        { geo: "roomLonger", x: -9.5, z: 0 },
    ];

    const walls = wallSpecs.map(({ geo, x, y = 1, z, ry = 0 }) => {
        const mesh = new THREE.Mesh(wallGeometries[geo], wallMaterial);
        mesh.position.set(x, y, z);
        mesh.rotation.y = ry;
        scene.add(mesh);
        return mesh;
    });

    scene.add(floor);

    return {
        floor,
        walls,
    };
}