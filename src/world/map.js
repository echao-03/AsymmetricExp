import * as THREE from "three";
import { Laser } from "../lasers";

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
    longer: new THREE.BoxGeometry(0.5, 2, 12),
    short: new THREE.BoxGeometry(0.5, 2, 5),
    roomShort: new THREE.BoxGeometry(0.5, 2, 3),
    roomShorter: new THREE.BoxGeometry(0.5, 2, 2),
    roomLong: new THREE.BoxGeometry(0.5, 2, 4),
    roomLonger: new THREE.BoxGeometry(0.5, 2, 6),
    mazeRoomLS1: new THREE.BoxGeometry(0.5, 2, 25),
    mazeRoomLS2: new THREE.BoxGeometry(0.5, 2, 22),
  };

  const laserState = {
    lasers: [],
  };

  
  // const laserBox1 = new THREE.Mesh(
  //   new THREE.BoxGeometry(0.2, 2, 2.8),
  //   new THREE.MeshBasicMaterial({
  //     color: "red",
  //     opacity: 0.3,s
  //     transparent: "true",
  //   }),
  // );
  
  // laserBox1.position.set(-29.25, 1, -8.7);
  // laserBox1.rotateY(Math.PI / 2);

  const laser1 = new Laser(scene, "Laser1", 0.2, 2, 2.8, -29.25, 1, -8.7, true);
  const laser2 = new Laser(scene, "Laser2", 0.2, 2, 1.5, -7.5, 0.5, -7.3, true);
  
  // const laserBox3 = new THREE.Mesh(
  //   new THREE.BoxGeometry(0.2, 0.2, 2.8),
  //   new THREE.MeshBasicMaterial({
  //     color: "red",
  //     opacity: 0.3,
  //     transparent: "true",
  //   }),
  // );
  
  // laserBox3.position.set(-29.25, 1.3, -8.7);
  // laserBox3.rotateY(Math.PI / 2);
  // scene.add(laserBox3);

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
    { geo: "longer", x: 12, z: 5, ry: Math.PI / 2 },
    { geo: "longer", x: 12, z: -5, ry: Math.PI / 2 },
    { geo: "roomLong", x: 18, z: -3 },
    { geo: "roomLong", x: 18, z: 3 },
    { geo: "roomLong", x: 20, z: -1.25, ry: Math.PI / 2 },
    { geo: "roomLong", x: 20, z: 1.25, ry: Math.PI / 2 },
    { geo: "roomShorter", x: 22, z: 0 },

    // Room frame for Maze Room
    { geo: "long", x: -6.5, z: -6 },
    { geo: "long", x: -6.5, z: 6 },
    { geo: "mazeRoomLS1", x: -18, z: -11, ry: Math.PI / 2 },
    { geo: "mazeRoomLS1", x: -18, z: 11, ry: Math.PI / 2 },
    { geo: "mazeRoomLS2", x: -30.5, z: 0 },

    // Main hallway for Maze Room
    { geo: "roomLonger", x: -9, z: -1.5, ry: Math.PI / 2 },
    { geo: "roomLonger", x: -9, z: 1.5, ry: Math.PI / 2 },
    { geo: "roomLong", x: -17, z: 1.5, ry: Math.PI / 2 },
    { geo: "roomLong", x: -17, z: -1.5, ry: Math.PI / 2 },
    { geo: "roomShort", x: -23, z: 1.5, ry: Math.PI / 2 },
    { geo: "roomShort", x: -23, z: -1.5, ry: Math.PI / 2 },
    { geo: "roomShort", x: -24, z: 0 },

    // Top right quadrant of Maze Room
    { geo: "roomLonger", x: -11.5, z: -4.25 },
    { geo: "roomLong", x: -10.25, z: -7.25, ry: Math.PI / 2 },
    { geo: "roomLonger", x: -10, z: -6.5 },
    { geo: "roomLonger", x: -10, z: -6.5 },

    { geo: "roomLong", x: -17, z: -3.5 },
    { geo: "roomShort", x: -15.5, z: -3.5, ry: Math.PI / 2 },
    { geo: "roomShort", x: -14, z: -4.75 },
    { geo: "roomLong", x: -15.5, z: -8.5 },
    { geo: "roomShort", x: -14, z: -8.5, ry: Math.PI / 2 },
    { geo: "roomShort", x: -18.25, z: -5.5, ry: Math.PI / 2 },
    { geo: "roomShorter", x: -19, z: -4.75 },

    { geo: "roomLong", x: -19, z: -9, ry: Math.PI / 2 },
    { geo: "roomShorter", x: -17.25, z: -8 },
    { geo: "roomShorter", x: -18, z: -7, ry: Math.PI / 2 },

    { geo: "roomLong", x: -23, z: -9 },
    { geo: "roomShort", x: -24.25, z: -7, ry: Math.PI / 2 },
    { geo: "roomShorter", x: -26, z: -7.75 },
    { geo: "roomShorter", x: -27, z: -8.5, ry: Math.PI / 2 },

    { geo: "roomShort", x: -24.75, z: -4 },
    { geo: "roomShorter", x: -22.25, z: -4, ry: Math.PI / 2 },

    { geo: "roomShorter", x: -29.25, z: -4, ry: Math.PI / 2 },

    { geo: "roomShort", x: -27.5, z: 0 },

    { geo: "roomShorter", x: -29.25, z: 3, ry: Math.PI / 2 },

    { geo: "roomLong", x: -28.25, z: 9, ry: Math.PI / 2 },
    { geo: "roomLong", x: -26.25, z: 7 },
    { geo: "roomLong", x: -24.25, z: 7, ry: Math.PI / 2 },
    { geo: "roomShort", x: -24.25, z: 8.5 },

    { geo: "roomShorter", x: -24.25, z: 4 },

    { geo: "roomLong", x: -18, z: 3.25 },
    { geo: "roomShort", x: -19.5, z: 5, ry: Math.PI / 2 },

    { geo: "roomLong", x: -19, z: 9, ry: Math.PI / 2 },
    { geo: "roomShorter", x: -18, z: 10 },

    { geo: "roomLong", x: -15, z: 7 },
    { geo: "roomShort", x: -13.5, z: 9, ry: Math.PI / 2 },

    { geo: "roomLong", x: -13, z: 5 },
    { geo: "roomShort", x: -14.25, z: 3, ry: Math.PI / 2 },

    { geo: "roomShorter", x: -11, z: 10 },

    { geo: "roomLong", x: -11, z: 3.25 },
    { geo: "roomShort", x: -9.5, z: 5, ry: Math.PI / 2 },
    { geo: "roomShort", x: -9.5, z: 6.5 },
  ];

  const walls = wallSpecs.map(({ geo, x, y = 1, z, ry = 0 }) => {
    const mesh = new THREE.Mesh(wallGeometries[geo], wallMaterial);
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry;
    scene.add(mesh);
    return mesh;
  });

  scene.add(floor);
  
  laserState.lasers.push(laser1);
  laserState.lasers.push(laser2);

  return {
    floor,
    walls,
    laserState,
  };
}
