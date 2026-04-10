import * as THREE from "three";

export function createMap(scene) {
    const floorGeometry = new THREE.BoxGeometry(100, 0.5, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: "gray",
        roughness: 0.35,
        metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    const wallMaterial = new THREE.MeshStandardMaterial({
        color: "rgb(64, 64, 64)",
        roughness: 0.35,
        metalness: 0.1,
    });

    const wallGeometries = {
        long: new THREE.BoxGeometry(0.5, 2, 10),
        short: new THREE.BoxGeometry(0.5, 2, 5),
        roomShort: new THREE.BoxGeometry(0.5, 2, 3),
        roomLong: new THREE.BoxGeometry(0.5, 2, 4),
        roomLonger: new THREE.BoxGeometry(0.5, 2, 6),
        mazeRoomLS1: new THREE.BoxGeometry(0.5, 2, 25),
        mazeRoomLS2: new THREE.BoxGeometry(0.5, 2, 22),
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
        { geo: "long", x: 9.5, z: 0 },

        // Room frame for Maze Room
        { geo: "long", x: -6.5, z: -6 },
        { geo: "long", x: -6.5, z: 6 },
        { geo: "mazeRoomLS1", x: -18, z: -11, ry: Math.PI / 2 },
        { geo: "mazeRoomLS1", x: -18, z: 11, ry: Math.PI / 2 },
        { geo: "mazeRoomLS2", x: -25.5, z: 0 },

        // Main hallway for Maze Room
        { geo: "roomLonger", x: -9, z: -1.5, ry: Math.PI / 2 },
        { geo: "roomLonger", x: -9, z: 1.5, ry: Math.PI / 2 },
        { geo: "roomShort", x: -16, z: 1.5, ry: Math.PI / 2 },
        { geo: "roomShort", x: -16, z: -1.5, ry: Math.PI / 2 },
        { geo: "roomShort", x: -21, z: 1.5, ry: Math.PI / 2 },
        { geo: "roomShort", x: -21, z: -1.5, ry: Math.PI / 2 },
        { geo: "roomShort", x: -22, z: 0 },

        // Top right quadrant of Maze Room
        { geo: "roomLonger", x: -12, z: -4.25 },
        { geo: "roomLong", x: -10.25, z: -7.25, ry: Math.PI / 2 },

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
