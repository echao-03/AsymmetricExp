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
    laserWalls = [],
    floor,
    playerRadius = 0.25,
    speed = 2.0,
    deadzone = 0,
    playerClone
}) {
    const controllerWorldPosition = new THREE.Vector3();
    // Quaternion is a number system that is applied in 3D space
    // It's used here on the controller in order to avoid gimbal lock issues, and understands rotations
    // Because of it, it's able to use the relative direction of where the controller is pointing, instead of 
    // only having the direction point straight from the headset
    // tl;dr, Quaternion can track the controller coordinate easily and know where it's pointing
    const controllerWorldQuaternion = new THREE.Quaternion();
    const controllerForward = new THREE.Vector3(0, 0, -1);
    const teleportVelocity = new THREE.Vector3();
    const teleportGravity = new THREE.Vector3(0, -9.8, 0);
    const teleportOrigin = new THREE.Vector3();
    const previousPoint = new THREE.Vector3();
    const nextPoint = new THREE.Vector3();
    const landingPoint = new THREE.Vector3();
    const teleportDestination = new THREE.Vector3();
    const localPoint = new THREE.Vector3();

    const floorBox = floor ? new THREE.Box3().setFromObject(floor) : null;
    const floorTopY = floorBox ? floorBox.max.y : 0;

    const wallBoxes = walls.map((wall) => new THREE.Box3().setFromObject(wall));
    const arcStep = 0.04;
    const maxArcTime = 1.4;
    const maxArcPoints = Math.floor(maxArcTime / arcStep) + 2;
    const arcPositions = new Float32Array(maxArcPoints * 3);
    const arcGeometry = new THREE.BufferGeometry();
    arcGeometry.setAttribute("position", new THREE.BufferAttribute(arcPositions, 3));
    arcGeometry.setDrawRange(0, 0);

    const arcMaterial = new THREE.LineBasicMaterial({
        color: 0x66ffcc,
        transparent: true,
        opacity: 0.95,
    });

    const teleportArc = new THREE.Line(arcGeometry, arcMaterial);
    teleportArc.frustumCulled = false;
    teleportArc.visible = false;
    rightController.add(teleportArc);

    const targetMaterial = new THREE.MeshBasicMaterial({
        color: 0x66ffcc,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
    });
    const teleportTarget = new THREE.Mesh(
        new THREE.RingGeometry(0.16, 0.24, 32),
        targetMaterial,
    );
    teleportTarget.rotation.x = -Math.PI / 2;
    teleportTarget.visible = false;
    playerRig.add(teleportTarget);

    const teleportThreshold = Math.max(0.75, deadzone + 0.15);
    const teleportLaunchSpeed = Math.max(5, speed * 3);
    const teleportReleaseLock = { active: false };

    const getBlockingBoxes = () => {
        const dynamicLaserBoxes = laserWalls
            .filter(laser => laser.mesh.visible)
            .map(laser => new THREE.Box3().setFromObject(laser.mesh));

        return wallBoxes.concat(dynamicLaserBoxes);
    };

    const collidesXZ = (x, z) => {
        for (const box of getBlockingBoxes()) {
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

    // Checks if the arc line intersects with the wall boundary. If it does, return true.
    const segmentIntersectsBox = (start, end, box) => {
        let minT = 0;
        let maxT = 1;

        for (const axis of ["x", "y", "z"]) {
            const delta = end[axis] - start[axis];

            if (Math.abs(delta) < 1e-8) {
                if (start[axis] < box.min[axis] || start[axis] > box.max[axis]) {
                    return false;
                }
                continue;
            }

            const invDelta = 1 / delta;
            let t1 = (box.min[axis] - start[axis]) * invDelta;
            let t2 = (box.max[axis] - start[axis]) * invDelta;

            if (t1 > t2) {
                [t1, t2] = [t2, t1];
            }

            minT = Math.max(minT, t1);
            maxT = Math.min(maxT, t2);

            if (maxT < minT) {
                return false;
            }
        }

        return maxT >= 0 && minT <= 1;
    };

    const hideTeleportViz = () => {
        teleportArc.visible = false;
        teleportArc.geometry.setDrawRange(0, 0);
        teleportTarget.visible = false;
    };

    const writeArcPoint = (index, worldPoint) => {
        const offset = index * 3;
        localPoint.copy(worldPoint);
        rightController.worldToLocal(localPoint);
        arcPositions[offset] = localPoint.x;
        arcPositions[offset + 1] = localPoint.y;
        arcPositions[offset + 2] = localPoint.z;
    };

    const buildTeleportArc = () => {
        rightController.updateMatrixWorld(true);
        rightController.getWorldPosition(controllerWorldPosition);
        rightController.getWorldQuaternion(controllerWorldQuaternion);

        teleportOrigin.copy(controllerWorldPosition);
        controllerForward.set(0, 0, -1).applyQuaternion(controllerWorldQuaternion).normalize();

        if (!Number.isFinite(controllerForward.x) || controllerForward.lengthSq() < 1e-8) {
            controllerForward.set(0, 0, -1);
        }

        teleportVelocity.copy(controllerForward).multiplyScalar(teleportLaunchSpeed);
        teleportVelocity.y = Math.max(teleportVelocity.y, teleportLaunchSpeed * 0.1); // Changes arc angle, more == more angled

        let pointCount = 0;
        let validTarget = false;

        writeArcPoint(pointCount, teleportOrigin);
        pointCount += 1;

        previousPoint.copy(teleportOrigin);

        for (let elapsed = 0; elapsed < maxArcTime; elapsed += arcStep) {
            teleportVelocity.addScaledVector(teleportGravity, arcStep);
            nextPoint.copy(previousPoint).addScaledVector(teleportVelocity, arcStep);

            const wallHit = getBlockingBoxes().some((box) => segmentIntersectsBox(previousPoint, nextPoint, box));

            if (wallHit) {
                break;
            }

            if (previousPoint.y >= floorTopY && nextPoint.y <= floorTopY) {
                const t = (floorTopY - previousPoint.y) / (nextPoint.y - previousPoint.y);
                landingPoint.copy(previousPoint).lerp(nextPoint, t);

                if (!collidesXZ(landingPoint.x, landingPoint.z)) {
                    writeArcPoint(pointCount, landingPoint);
                    pointCount += 1;
                    validTarget = true;
                }

                break;
            }

            writeArcPoint(pointCount, nextPoint);
            pointCount += 1;
            previousPoint.copy(nextPoint);
        }

        arcGeometry.attributes.position.needsUpdate = true;
        arcGeometry.setDrawRange(0, pointCount);
        teleportArc.visible = pointCount > 1;

        if (validTarget) {
            teleportDestination.copy(landingPoint);
            teleportTarget.visible = true;
            teleportTarget.position.copy(landingPoint);
            teleportTarget.position.y += 0.001;
            playerRig.worldToLocal(teleportTarget.position);
        } else {
            teleportTarget.visible = false;
        }

        return validTarget;
    };

    const teleportPlayer = () => {
        // console.log("in teleport", teleportTarget.visible);
        if (!teleportTarget.visible) {
            return;
        }
        playerRig.position.x = teleportDestination.x;
        playerRig.position.z = teleportDestination.z;
        console.log(playerRig.position.x, playerRig.position.z);


    };

    const fadePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0,
            depthTest: false,
            depthWrite: false,
        })
    );
    fadePlane.position.set(0, 0, -0.5);
    camera.add(fadePlane);

    const fadeState = {
        active: false,
        direction: 0, // 1 = fade out, -1 = fade in
        opacity: 0,
        duration: 0.18,
        onMidpoint: null,
    };

    function startTeleportFade(onMidpoint) {
        fadeState.active = true;
        fadeState.direction = 1;
        fadeState.opacity = 0;
        fadeState.onMidpoint = onMidpoint || null;
        fadePlane.material.opacity = 0;
        fadePlane.visible = true;
    }

    function updateTeleportFade(delta) {
        if (!fadeState.active) return;

        fadeState.opacity += fadeState.direction * (delta / fadeState.duration);
        fadeState.opacity = Math.min(1, Math.max(0, fadeState.opacity));
        fadePlane.material.opacity = fadeState.opacity;

        if (fadeState.direction === 1 && fadeState.opacity >= 1) {
            if (fadeState.onMidpoint) fadeState.onMidpoint();
            fadeState.direction = -1;
        } else if (fadeState.direction === -1 && fadeState.opacity <= 0) {
            fadeState.active = false;
            fadePlane.visible = false;
        }
    }
    function update(delta) {
        if (!renderer.xr.isPresenting) return;

        const gamepad = rightController.userData?.gamepad;

        updateTeleportFade(delta);

        if (!gamepad) {
            teleportReleaseLock.active = false;
            hideTeleportViz();
            controllerMarker.material.color.set(0xffff00); // Yellow = no gamepad
            onDebug?.(`No gamepad found on rightController`);
            return;
        }

        const axes = gamepad.axes || [];

        const usePair01 =
            Math.abs(axes[0] ?? 0) + Math.abs(axes[1] ?? 0) >=
            Math.abs(axes[2] ?? 0) + Math.abs(axes[3] ?? 0);

        const y = usePair01 ? (axes[1] ?? 0) : (axes[3] ?? 0);
        const thumbstickUp = y < -teleportThreshold;

        if (thumbstickUp) {
            const validTeleport = buildTeleportArc();
            teleportReleaseLock.active = true;
            controllerMarker.material.color.set(validTeleport ? 0x66ffcc : 0xff5555);
            onDebug?.(
                `teleport aiming gamepad=${gamepad.id} y=${y.toFixed(2)} valid=${validTeleport}`
            );
            return;
        }

        if (teleportReleaseLock.active) {
            if (teleportTarget.visible) {
                startTeleportFade(() => {
                    teleportTarget.visible = true; // I think when changing the target to be visible initially, it changes to false when entering startTeleportFade
                    teleportPlayer();
                });
                onDebug?.(`teleport committed`);
            } else {
                onDebug?.(`teleport cancelled`);
            }

            teleportReleaseLock.active = false;
        }

        hideTeleportViz();
        controllerMarker.material.color.set(0x00ff00);

        onDebug?.(
            `gamepad=${gamepad.id} axes=[${axes.map((v) => (typeof v === "number" ? v.toFixed(2) : "0.00")).join(", ")}] up=${thumbstickUp}`
        );
    }

    return { update };
}