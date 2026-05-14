import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMap } from "./world/map";
import { createVRMovement } from "./world/movement";
import { createMultiplayer } from "./world/multiplayer";
import "./style.css";
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";
import initPopups from "./initPopups";
import initCameras from "./initCameras";
import { createOverlay } from "./world/overlay";
import GrabVR from "./grabvr/src/client/grabvr.ts";
import callModels, { callDrone } from "./importModels.js";
import createMapCopy from "./world/mapCopy";
import droneInit, { droneUpdate } from "./droneLogic.js";
import tileUpdate, { isCorrect } from "./world/tiles.js";

const container = document.getElementById("app");
const cameraContainer = document.getElementById("camera-quadrant");
const mapContainer = document.getElementById("map-quadrant");

// Initialize cameras and camera manager
const { cameraManager, VRCamera, mapCamera } = initCameras();

// Audio Loader
const buttonPush = new Audio("./audio/ButtonPush.wav");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(VRCamera, renderer.domElement);
controls.target.set(-27, 1, -6.5);
controls.update();

const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

const playerRig = new THREE.Group();
const rigBox = new THREE.Box3().setFromObject(playerRig);
const rigBoxHelper = new THREE.Box3Helper(rigBox, 0x00ff00); // green wireframe
scene.add(rigBoxHelper);
playerRig.add(VRCamera);
playerRig.children[0].rotateY(20);
scene.add(playerRig);

// Righelper helps find rig position, if reset, camera resets to righelper position
const rigHelper = new THREE.AxesHelper(1);
playerRig.add(rigHelper);

const rigMarker = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.2, 0.2),
  new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true }),
);

//Rig marker position for reference
rigMarker.position.set(0, 0, -0.5);
playerRig.add(rigMarker);

const grabVR = new GrabVR();

const leftController = renderer.xr.getController(0);
const rightController = renderer.xr.getController(1);
const controllerGrip0 = renderer.xr.getControllerGrip(0);
const controllerGrip1 = renderer.xr.getControllerGrip(1);

leftController.addEventListener("connected", (event) => {
  leftController.userData.handedness = event.data.handedness;
  leftController.userData.gamepad = event.data.gamepad || null;
});

leftController.addEventListener("disconnected", () => {
  leftController.userData.gamepad = null;
});

rightController.addEventListener("connected", (event) => {
  rightController.userData.handedness = event.data.handedness;
  rightController.userData.gamepad = event.data.gamepad || null;
});

rightController.addEventListener("disconnected", () => {
  rightController.userData.gamepad = null;
});

controllerGrip0.addEventListener("connected", (event) => {
  controllerGrip0.add(controller1Marker);
  grabVR.add(0, controllerGrip0, event.data.gamepad);
});

controllerGrip1.addEventListener("connected", (event) => {
  controllerGrip1.add(controller2Marker);
  grabVR.add(1, controllerGrip1, event.data.gamepad);
});

playerRig.add(leftController);
playerRig.add(rightController);
playerRig.add(controllerGrip0);
playerRig.add(controllerGrip1);

const controller1Marker = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.08, 0.15),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
);

const controller2Marker = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 0.15, 0.08),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // todo: need to fix rotation of controller model, current marker doesn't accurately reflect hand placement
);

controllerGrip0.add(controller1Marker);

controllerGrip1.add(controller2Marker);

const debug = document.createElement("pre");
debug.className = "vr-debug";
document.body.appendChild(debug);

// Create map that vr user will navigate through
const { walls, floor, laserState, tiles } = createMap(scene);

const tilesOrder = [tiles[2], tiles[1], tiles[3], tiles[0], tiles[5], tiles[4]];
const tilesPlayer = [];

// Create a copy of the map for the map camera
const { wallsCopy, floorCopy, playerClone, radar } = createMapCopy(scene);
callModels(scene, grabVR, radar);

const { overlay } = createOverlay(scene);

const movement = createVRMovement({
  renderer,
  camera: VRCamera,
  playerRig,
  leftController,
  rightController,
  controllerMarker: controller2Marker,
  walls,
  laserWalls: laserState.lasers,
  floor,
  playerRadius: 0.25,
  onDebug: (text) => {
    debug.textContent = text;
  },
});

const multiplayer = createMultiplayer({
  scene,
  username: "Player",
  playerClone,
});

multiplayer.network.on("laser-state", (msg) => {
  const laser = laserState.lasers.find((l) => l.name === msg.laserName);
  if (laser) {
    laser.setLasersActive(msg.active);
  }
});

// Initialize popups
initPopups({
  // onCodeAccepted: () => {
  //   // inform server to broadcast to everyone (safe to send even if not connected)
  //   if (multiplayer && multiplayer.network && multiplayer.network.isConnected) {
  //     multiplayer.network.send({ type: 'laser-state', active: false });
  //   }
  // },
  laserState,
  radar,
  multiplayer,
});

const drone = await callDrone(scene);

const { dronePoints, dronePrevPosition, droneForwardTarget } = droneInit(drone);

const hint = document.createElement("div");
hint.className = "vr-hint";
hint.textContent =
  "Desktop: drag to orbit. VR: push the right thumbstick up to aim a teleport arc, then release to move.";
document.body.appendChild(hint);

const hemiLight = new THREE.HemisphereLight(0xbfd6ff, 0x1c2532, 1.1);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(2, 4, 1);
scene.add(dirLight);

window.addEventListener("resize", () => {
  mapCamera.aspect = container.clientWidth / container.clientHeight;
  mapCamera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

function renderInContainer(cam, el) {
  const r = el.getBoundingClientRect();

  const x = Math.floor(r.left);
  const y = Math.floor(window.innerHeight - r.bottom); // WebGL origin is bottom-left
  const w = Math.floor(r.width);
  const h = Math.floor(r.height);

  cam.aspect = w / h;
  cam.updateProjectionMatrix();

  renderer.setViewport(x, y, w, h);
  renderer.setScissor(x, y, w, h);
  renderer.render(scene, cam);
}
const clock = new THREE.Clock();

// Arrow key movement
const keyState = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};
const movementSpeed = 3; // units per second

window.addEventListener("keydown", (e) => {
  if (e.key in keyState) {
    keyState[e.key] = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key in keyState) {
    keyState[e.key] = false;
  }
});

// Need this const to track when movement of drone started
const moveStartTime = performance.now();
// playerRig Y position must be < 1 to collide with tiles
playerRig.position.set(15, 0.8, 0);
console.log(playerRig);
playerRig.scale.set(0.1, 0.4, 0.2);

let isColliding = false;
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();

  // Handle arrow key movement
  const moveDistance = movementSpeed * delta;
  if (keyState.ArrowUp) {
    playerRig.position.z -= moveDistance;
  }
  if (keyState.ArrowDown) {
    playerRig.position.z += moveDistance;
  }
  if (keyState.ArrowLeft) {
    playerRig.position.x -= moveDistance;
  }
  if (keyState.ArrowRight) {
    playerRig.position.x += moveDistance;
  }

  movement.update(delta);
  controls.update();
  grabVR.update(delta);

  //Radar animation
  radar.update(delta);

  multiplayer.updatePose(
    VRCamera,
    leftController,
    rightController,
    playerRig,
    playerClone,
  );

  const elapsed = (performance.now() - moveStartTime) / 1000;

  // 2 is the total speed of the drone
  // true bool for whether drone will loop
  droneUpdate(
    drone,
    dronePoints,
    dronePrevPosition,
    droneForwardTarget,
    elapsed,
    2,
    true,
    -1,
    radar,
    playerRig,
  );

  rigBox.setFromObject(playerRig);

  tileUpdate(tiles, tilesOrder, tilesPlayer, playerRig, isColliding);
  isCorrect(tilesPlayer, tilesOrder, laserState.lasers[2]);

  if (renderer.xr.isPresenting) {
    renderer.render(scene, VRCamera);
  } else {
    renderer.setScissorTest(true);
    renderer.clear();
    renderInContainer(mapCamera, mapContainer);
    renderInContainer(cameraManager.getActiveCamera(), cameraContainer);
    renderer.setScissorTest(false);
  }
});

renderer.xr.addEventListener("sessionstart", () => {
  controls.enabled = false;
});

renderer.xr.addEventListener("sessionend", () => {
  controls.enabled = true;
  controls.update();
});

// Clean up network when page unloads
window.addEventListener("beforeunload", () => {
  multiplayer.dispose();
});
