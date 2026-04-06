import * as THREE from "three";

export function createVRMovement({
    renderer,
    camera,
    playerRig,
    leftController,
    rightController,
    controllerMarker,
    onDebug,
    speed = 2.0,      // units per second
    deadzone = 0.15,
}) {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const clock = new THREE.Clock();

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

        if (!active) return;

        // Move relative to headset forward direction, flattened to ground plane
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, camera.up).normalize();

        const dt = clock.getDelta();
        playerRig.position.addScaledVector(forward, -y * speed * dt);
        playerRig.position.addScaledVector(right, x * speed * dt);
    }

    return { update };
}