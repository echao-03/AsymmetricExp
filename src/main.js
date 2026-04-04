import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMap } from "./world/map";
import { createVRMovement } from "./world/movement";
import "./style.css";

const container = document.getElementById("app");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 0);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);
controls.update();

const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

const playerRig = new THREE.Group();
playerRig.add(camera);
scene.add(playerRig);

const rigHelper = new THREE.AxesHelper(1);
playerRig.add(rigHelper);

const rigMarker = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
);
rigMarker.position.set(0, 0, -0.5);
playerRig.add(rigMarker);

const leftController = renderer.xr.getController(0);
const rightController = renderer.xr.getController(1);

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

playerRig.add(leftController);
playerRig.add(rightController);

const controller1Marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.15),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);

const controller2Marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.15),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
leftController.add(controller1Marker);

rightController.add(controller2Marker);

const debug = document.createElement("pre");
debug.className = "vr-debug";
document.body.appendChild(debug);

const movement = createVRMovement({
    renderer,
    camera,
    playerRig,
    leftController,
    controllerMarker: controller1Marker,

    onDebug: (text) => {
        debug.textContent = text;
    },
});

const hint = document.createElement("div");
hint.className = "vr-hint";
hint.textContent = "Desktop: drag to orbit. VR: click Enter VR.";
document.body.appendChild(hint);

const hemiLight = new THREE.HemisphereLight(0xbfd6ff, 0x1c2532, 1.1);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(2, 4, 1);
scene.add(dirLight);

createMap(scene);





window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



renderer.setAnimationLoop(() => {
    movement.update();
    controls.update();
    renderer.render(scene, camera);
});

renderer.xr.addEventListener("sessionstart", () => {
    controls.enabled = false;
});

renderer.xr.addEventListener("sessionend", () => {
    controls.enabled = true;
    controls.update();
});
