import * as THREE from "three";
import { CameraManager } from "./cameraManager";

export default function initCameras() {
    const container = document.getElementById("app");
    const mapContainer = document.getElementById("map-quadrant");
    const cameraContainer = document.getElementById("camera-quadrant");
    const cameraPrevButton = document.getElementById("prev-button");
    const cameraResetButton = document.getElementById("reset-button");
    const cameraNextButton = document.getElementById("next-button");

    const VRCamera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        100,
    );

    const mapCamera = new THREE.PerspectiveCamera(
        80,
        mapContainer.clientWidth / mapContainer.clientHeight,
        0.1,
        100,
    );
    // mapCamera original Position: (0, 1.2, 0) *Moved position to see maze room*
    mapCamera.position.set(-16, 18, 0);
    mapCamera.lookAt(-16, 0, 0);   

    const intersectionCamera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    intersectionCamera.position.set(-1, 2.5, -1);
    intersectionCamera.lookAt(1, 0, 2);

    // Cameras for the maze room
    const R1Camera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    R1Camera.position.set(9, 2, 0);
    R1Camera.lookAt(1, 1, 0);

    const urightQuadCamera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    urightQuadCamera.position.set(-10, 2, -2);
    urightQuadCamera.lookAt(-9, 0, -3.5);

    const brightQuadCamera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    brightQuadCamera.position.set(-10, 2, 2);
    brightQuadCamera.lookAt(-9.5, 0, 3.5);

    const uleftQuadCamera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    uleftQuadCamera.position.set(-25, 2, -7.5);
    uleftQuadCamera.lookAt(-24, 0, -8.5);

    const bleftQuadCamera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    bleftQuadCamera.position.set(-26, 2, 10.5);
    bleftQuadCamera.lookAt(-24, 0, 6.5);

    const R1Default = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    R1Default.position.set(-24, 2, 0);
    R1Default.lookAt(-15, 0, 0);

    const R2Camera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    R2Camera.position.set(-9, 2, 0);
    R2Camera.lookAt(1, 1, 0);

    const cameras = [[intersectionCamera, R1Camera, R2Camera, intersectionCamera], [R1Default, uleftQuadCamera, urightQuadCamera, brightQuadCamera, bleftQuadCamera], [R2Camera, intersectionCamera, R1Camera, intersectionCamera]];

    const cameraManager = new CameraManager({
        cameraContainer,
        prevButton: cameraPrevButton,
        resetButton: cameraResetButton,
        nextButton: cameraNextButton,
        roomCameras: cameras,
    });

    return {
        cameraManager,
        VRCamera,
        mapCamera,
    };
}