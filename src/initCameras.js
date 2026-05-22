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
  VRCamera.position.set(5, 0, 0);

  const mapCamera = new THREE.PerspectiveCamera(
    80,
    mapContainer.clientWidth / mapContainer.clientHeight,
    0.1,
    100,
  );
  // mapCamera original Position: (0, 1.2, 0) *Moved position to see maze room*
  // Moved 200 units to 184
  //default 6
  mapCamera.position.set(200, 6, 0);
  mapCamera.lookAt(200, 0, 0);

  // mapCamera.position.set(211, 10, 0)
  // mapCamera.lookAt(211, 0, 0)

  // mapCamera.position.set(-10, 17, 0);
  // mapCamera.lookAt(-10, 0, 0);

  const intersectionCamera = new THREE.PerspectiveCamera(
    75,
    cameraContainer.clientWidth / cameraContainer.clientHeight,
    0.1,
    100,
  );
  intersectionCamera.position.set(-1, 3, 1);
  intersectionCamera.lookAt(1, 0, 0.5);

  // Cameras for the maze room
  // const R1Camera = new THREE.PerspectiveCamera(
  //   75,
  //   cameraContainer.clientWidth / cameraContainer.clientHeight,
  //   0.1,
  //   100,
  // );
  // R1Camera.position.set(9, 2, 0);
  // R1Camera.lookAt(1, 1, 1);


  //Green camera
  const urightQuadCamera = new THREE.PerspectiveCamera(
    75,
    cameraContainer.clientWidth / cameraContainer.clientHeight,
    0.1,
    100,
  );
  urightQuadCamera.position.set(-10, 2, -2);
  urightQuadCamera.lookAt(-9, 0, -3.5);


  //Cyan
  const brightQuadCamera = new THREE.PerspectiveCamera(
    75,
    cameraContainer.clientWidth / cameraContainer.clientHeight,
    0.1,
    100,
  );
  brightQuadCamera.position.set(-10, 2, 2);
  brightQuadCamera.lookAt(-9.5, 0, 3.5);

  //Blue
  const uleftQuadCamera = new THREE.PerspectiveCamera(
    75,
    cameraContainer.clientWidth / cameraContainer.clientHeight,
    0.1,
    100,
  );
  uleftQuadCamera.position.set(-25, 2, -7.5);
  uleftQuadCamera.lookAt(-24, 0, -8.5);

  //Yellow
  const bleftQuadCamera = new THREE.PerspectiveCamera(
    75,
    cameraContainer.clientWidth / cameraContainer.clientHeight,
    0.1,
    100,
  );
  bleftQuadCamera.position.set(-26, 2, 10.5);
  bleftQuadCamera.lookAt(-24, -1.5, 6.5);

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
  R2Camera.position.set(9, 2, -3);
  R2Camera.lookAt(9, 0, 0);

  const R2Camera2 = new THREE.PerspectiveCamera(
    75,
    cameraContainer.clientWidth / cameraContainer.clientHeight,
    0.1,
    100,
  );
  R2Camera2.position.set(17, 2, -3);
  R2Camera2.lookAt(9, 0, 0);

  const cameras = [
    [intersectionCamera],
    [
      R1Default,
      uleftQuadCamera,
      urightQuadCamera,
      brightQuadCamera,
      bleftQuadCamera,
    ],
    [R2Camera, R2Camera2],
  ];

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
