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
import GrabVR from './grabvr/src/client/grabvr.ts';
import callModels from "./importModels.js";

const container = document.getElementById("app");
const cameraContainer = document.getElementById("camera-quadrant");
const mapContainer = document.getElementById("map-quadrant");

// Initialize cameras and camera manager
const {
  cameraManager,
  VRCamera,
  mapCamera
} = initCameras();

// Audio Loader
const buttonPush = new Audio("./audio/ButtonPush.wav");

const LASER_DISABLE_CODE = "195653";
const laserState = {
  active: true,
  boxes: [],
};

const setLasersActive = (isActive) => {
  laserState.active = isActive;
  laserState.boxes.forEach((laser) => {
    laser.visible = isActive;
  });
};

// Initialize popups
initPopups({
  requiredCode: LASER_DISABLE_CODE,
  onCodeAccepted: () => {
    setLasersActive(false);
  },
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(mapCamera, renderer.domElement);
controls.target.set(-27, 1, -6.5);
controls.update();


const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

const playerRig = new THREE.Group();
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
rigMarker.position.set(0, 0, -0.5);
playerRig.add(rigMarker);

const grabVR = new GrabVR();

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1.0, 1.0, 1.0),
  new THREE.MeshBasicMaterial({
    color: 0xff0066,
    wireframe: true
  })
)
scene.add(box)
grabVR.grabableObjects().push(box);



const leftController = renderer.xr.getController(0);
const rightController = renderer.xr.getController(1);
const controllerGrip0 = renderer.xr.getControllerGrip(0)
const controllerGrip1 = renderer.xr.getControllerGrip(1)


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
  controllerGrip0.add(controller1Marker)
  grabVR.add(0, controllerGrip0, event.data.gamepad)
})

controllerGrip1.addEventListener("connected", (event) => {
  controllerGrip1.add(controller2Marker)
  grabVR.add(1, controllerGrip1, event.data.gamepad)
})

playerRig.add(leftController);
playerRig.add(rightController);
playerRig.add(controllerGrip0);
playerRig.add(controllerGrip1);

const controller1Marker = new THREE.Mesh(
  new THREE.BoxGeometry(0.20, 0.08, 0.15),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
);

const controller2Marker = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 0.15, 0.08),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // todo: need to fix rotation of controller model, current marker doesn't accurately reflect hand placement
);

controllerGrip0.add(controller1Marker);

controllerGrip1.add(controller2Marker);

callModels(scene, grabVR);

const debug = document.createElement("pre");
debug.className = "vr-debug";
document.body.appendChild(debug);

const { walls, floor } = createMap(scene);

const { overlay } = createOverlay(scene);

const movement = createVRMovement({
  renderer,
  camera: VRCamera,
  playerRig,
  leftController,
  rightController,
  controllerMarker: controller2Marker,
  walls,
  laserWalls: laserState.boxes,
  isLasersActive: () => laserState.active,
  floor,
  playerRadius: 0.25,
  onDebug: (text) => {
    debug.textContent = text;
  },
});

const laserBox1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.2, 2.8),
  new THREE.MeshBasicMaterial({
    color: 'red',
    opacity: 0.3,
    transparent: 'true',
  })
)

laserBox1.position.set(-27.1, 1, -6.7);
laserBox1.rotateY(Math.PI / -3.3);

scene.add(laserBox1);

const laserBox2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.2, 2.8),
  new THREE.MeshBasicMaterial({
    color: 'red',
    opacity: 0.3,
    transparent: 'true',
  })
)

laserBox2.position.set(-27.1, 0.5, -6.7);
laserBox2.rotateY(Math.PI / -3.3);
scene.add(laserBox2);

const laserBox3 = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.2, 2.8),
  new THREE.MeshBasicMaterial({
    color: 'red',
    opacity: 0.3,
    transparent: 'true',
  })
)

laserBox3.position.set(-27.1, 1.3, -6.7);
laserBox3.rotateY(Math.PI / -3.3);
scene.add(laserBox3);

laserState.boxes.push(laserBox1, laserBox2, laserBox3);
setLasersActive(true);



const hint = document.createElement("div");
hint.className = "vr-hint";
hint.textContent = "Desktop: drag to orbit. VR: push the right thumbstick up to aim a teleport arc, then release to move.";
document.body.appendChild(hint);

const hemiLight = new THREE.HemisphereLight(0xbfd6ff, 0x1c2532, 1.1);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(2, 4, 1);
scene.add(dirLight);

const multiplayer = createMultiplayer({ scene, username: "Player" });

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
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  movement.update(delta);
  controls.update();
  grabVR.update(delta);
  multiplayer.updatePose(VRCamera, leftController, rightController, playerRig);

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
