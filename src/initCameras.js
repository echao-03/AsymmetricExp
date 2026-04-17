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
        75,
        mapContainer.clientWidth / mapContainer.clientHeight,
        0.1,
        100,
    );
    // mapCamera original Position: (0, 1.2, 0) *Moved position to see maze room*
    mapCamera.position.set(-12, 20, 0);
    mapCamera.lookAt(-12, 0, 0);   

    const intersectionCamera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    intersectionCamera.position.set(-1, 2.5, -1);
    intersectionCamera.lookAt(1, 0, 2);

    const R1Camera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    R1Camera.position.set(9, 2, 0);
    R1Camera.lookAt(1, 1, 0);

    const R2Camera = new THREE.PerspectiveCamera(
        75,
        cameraContainer.clientWidth / cameraContainer.clientHeight,
        0.1,
        100,
    );
    R2Camera.position.set(-9, 2, 0);
    R2Camera.lookAt(1, 1, 0);

    const cameras = [[intersectionCamera, R1Camera, R2Camera], [R1Camera, R2Camera, intersectionCamera], [R2Camera, intersectionCamera, R1Camera]];

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