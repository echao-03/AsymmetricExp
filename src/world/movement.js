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
    playerRadius = 0.25,
    speed = 2.0,      // units per second
    deadzone = 0,
}) {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const clock = new THREE.Clock();

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



        // Try common XR thumbstick mappings
        const usePair01 =
            Math.abs(axes[0] ?? 0) + Math.abs(axes[1] ?? 0) >=
            Math.abs(axes[2] ?? 0) + Math.abs(axes[3] ?? 0);

        const x = usePair01 ? (axes[0] ?? 0) : (axes[2] ?? 0);
        const y = usePair01 ? (axes[1] ?? 0) : (axes[3] ?? 0);

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

            const currentX = playerRig.position.x;
            const currentZ = playerRig.position.z;

            const nextX = currentX + dx;
            const nextZ = currentZ + dz;

            // Move X if no collision
            if (!collidesXZ(nextX, currentZ)) {
                playerRig.position.x = nextX;
            }

            // Move Z if no collision
            if (!collidesXZ(playerRig.position.x, nextZ)) {
                playerRig.position.z = nextZ;
            }

            // Optional: keep player on floor bounds (20x25 floor centered at origin)
            playerRig.position.x = THREE.MathUtils.clamp(playerRig.position.x, -9.7, 9.7);
            playerRig.position.z = THREE.MathUtils.clamp(playerRig.position.z, -12.2, 12.2);
        }
    }

    return { update };
}