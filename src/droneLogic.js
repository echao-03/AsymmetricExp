import * as THREE from "three";


export default function droneInit(drone) {

    const dronePrevPosition = new THREE.Vector3();
    const droneForwardTarget = new THREE.Vector3();
    const loopDrone = true;
    dronePrevPosition.copy(drone.position);
    const droneYawOffset = -1;
    const dronePoints = [
        new THREE.Vector3(-26.5, 1.5, 4),
        new THREE.Vector3(-26.5, 1.5, -3),
        new THREE.Vector3(-28.5, 1.5, -3),
        new THREE.Vector3(-28.5, 1.5, 2),
        new THREE.Vector3(-26, 1.5, 2),
        new THREE.Vector3(-26, 1.5, -5),
        new THREE.Vector3(-24, 1.5, -6),
        new THREE.Vector3(-20.5, 1.5, -6),
        new THREE.Vector3(-20.5, 1.5, -3),
        new THREE.Vector3(-22, 1.5, -3),
        new THREE.Vector3(-20.5, 1.5, -3),
        new THREE.Vector3(-20.5, 1.5, -6),
        new THREE.Vector3(-24, 1.5, -6),
        new THREE.Vector3(-26.5, 1.5, -5),
        new THREE.Vector3(-26.5, 1.5, 4),
        new THREE.Vector3(-25, 1.5, 4),
        new THREE.Vector3(-25, 1.5, 6),
        new THREE.Vector3(-16, 1.5, 6),
        new THREE.Vector3(-16, 1.5, 7.5),
        new THREE.Vector3(-20, 1.5, 7.5),
        new THREE.Vector3(-20, 1.5, 6),
        new THREE.Vector3(-16, 1.5, 6),
        new THREE.Vector3(-25, 1.5, 6),
        new THREE.Vector3(-25, 1.5, 4),
    ];

    return { dronePoints, dronePrevPosition, droneForwardTarget };
}

export function droneUpdate(
    drone,
    dronePoints,
    dronePrevPosition,
    droneForwardTarget,
    elapsed,
    speed,
    loopDrone,
    droneYawOffset = -1,
    radar,
    playerRig,
) {

    const segmentCount = dronePoints.length;
    if (segmentCount < 1) return;

    const segments = [];
    let totalLength = 0;

    for (let i = 0; i < segmentCount; i++) {
        let start = dronePoints[i];
        let end;
        if (loopDrone) {
            end = dronePoints[(i + 1) % dronePoints.length]
        }
        else {
            end = dronePoints[i + 1];
        }

        if (!start || !end) {
            return;
        }

        const length = start.distanceTo(end);
        segments.push({ start, end, length });
        totalLength += length;
    }

    if (totalLength <= 1e-8) return;

    let distanceTraveled = speed * elapsed;

    if (loopDrone) {
        distanceTraveled = distanceTraveled % totalLength;
        if (distanceTraveled < 0) distanceTraveled += totalLength;
    } else {
        distanceTraveled = Math.min(distanceTraveled, totalLength);
    }

    let remaining = distanceTraveled;
    let activeSegment = segments[segments.length - 1];

    for (const segment of segments) {
        if (remaining <= segment.length) {
            activeSegment = segment;
            break;
        }
        remaining -= segment.length;
    }

    const segmentT = activeSegment.length > 0 ? remaining / activeSegment.length : 0;
    drone.position.lerpVectors(activeSegment.start, activeSegment.end, segmentT);

    const movementDelta = new THREE.Vector3().subVectors(
        drone.position,
        dronePrevPosition,
    );

    // Only rotate when it actually moved this frame
    if (movementDelta.lengthSq() > 1e-8) {
        movementDelta.y = 0; // yaw only, no pitch
        movementDelta.normalize();

        droneForwardTarget.copy(drone.position).add(movementDelta);
        drone.lookAt(droneForwardTarget.x, drone.position.y, droneForwardTarget.z);

        // Apply model forward-axis correction if needed
        drone.rotateY(droneYawOffset);
    }

    dronePrevPosition.copy(drone.position);

    const playerPosition = playerRig.getWorldPosition(new THREE.Vector3());
    // playerPosition.x = playerPosition.x - 200; / / adjust for radar offset
    // console.log("Player position:", playerPosition);
    const distanceToPlayer = drone.position.distanceTo(playerPosition);
    // console.log(distanceToPlayer);

    if (distanceToPlayer < 2) {
        console.log("Player caught by drone!");
        playerRig.position.set(0, 0, 0);
    }
}