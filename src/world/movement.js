import * as THREE from "three";

export function createVRMovement({
    renderer,
    camera,
    playerRig,
    leftController,
    rightController,
    controllerMarker,
    onDebug,
    walls = [],
    floor,
    playerRadius = 0.25,
    speed = 2.0,      // units per second
    deadzone = 0,
}) {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const clock = new THREE.Clock();

    const headWorld = new THREE.Vector3();
    const rigWorld = new THREE.Vector3();
    const headOffset = new THREE.Vector3();

    const wallBoxes = walls.map((wall) => new THREE.Box3().setFromObject(wall));
    const collidesXZ = (x, z) => {
        for (const box of wallBoxes) {
            const minX = box.min.x - playerRadius;
            const maxX = box.max.x + playerRadius;
            const minZ = box.min.z - playerRadius;
            const maxZ = box.max.z + playerRadius;

            if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
                return true;
            }
        }
        return false;
    };

    function update() {
        if (!renderer.xr.isPresenting) return;

        // Use gamepad stored in userData from connected event
        const gamepad = rightController.userData?.gamepad;

        if (!gamepad) {
            controllerMarker.material.color.set(0xffff00); // Yellow = no gamepad
            onDebug?.(`No gamepad found on rightController`);
            return;
        }

        const axes = gamepad.axes || [];

        const usePair01 =
            Math.abs(axes[0] ?? 0) + Math.abs(axes[1] ?? 0) >=
            Math.abs(axes[2] ?? 0) + Math.abs(axes[3] ?? 0);

        const x = usePair01 ? (axes[0] ?? 0) : (axes[2] ?? 0);
        const y = usePair01 ? (axes[1] ?? 0) : (axes[3] ?? 0);

        // Checks if thumbstick is moving, will set hand to color red
        const active = Math.abs(x) > deadzone || Math.abs(y) > deadzone;
        controllerMarker.material.color.set(active ? 0xff0000 : 0x00ff00);

        onDebug?.(
            `gamepad=${gamepad.id} axes=[${axes.map(v => v.toFixed(2)).join(", ")}] active=${active}`
        );
        const dt = clock.getDelta();

        if (active) {
            camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();
            right.crossVectors(forward, camera.up).normalize();

            const moveForward = -y * speed * dt;
            const moveRight = x * speed * dt;

            const dx = forward.x * moveForward + right.x * moveRight;
            const dz = forward.z * moveForward + right.z * moveRight;

            camera.getWorldPosition(headWorld);
            playerRig.getWorldPosition(rigWorld);

            headOffset.copy(headWorld).sub(rigWorld);

            let nextHeadX = headWorld.x + dx;
            let nextHeadZ = headWorld.z + dz;

            // If head position collides, then don't move
            // Current problem is that if head is sticking through walls,
            // Player cannot move, even resetting position will reset player back to where the camera is positioned
            // todo: Find a way so that if player get stuck in wall, reset and they are outside the wall
            if (!collidesXZ(nextHeadX, headWorld.z)) {
                headWorld.x = nextHeadX;
            }
            if (!collidesXZ(headWorld.x, nextHeadZ)) {
                headWorld.z = nextHeadZ;
            }

            headWorld.x = THREE.MathUtils.clamp(headWorld.x, -300, 300);
            headWorld.z = THREE.MathUtils.clamp(headWorld.z, -300, 300);

            // 4) Reconstruct rig so headset ends at desired headWorld
            playerRig.position.x = headWorld.x - headOffset.x;
            playerRig.position.z = headWorld.z - headOffset.z;
        }
    }

    return { update };
}