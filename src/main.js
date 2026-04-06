import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMap } from "./world/map";
import { createVRMovement } from "./world/movement";
import NetworkClient from "./NetworkClient.js";
import Avatar from "./Avatar.js";
import "./style.css";

const container = document.getElementById("app");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);

const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 15, 0);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);
controls.update();
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = false;

const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

const playerRig = new THREE.Group();
scene.add(playerRig);

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
cameraGroup.rotation.y = Math.PI / 2;
scene.add(cameraGroup)

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
    console.log(rightController.userData.gamepad);
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

const { walls } = createMap(scene);



const movement = createVRMovement({
    renderer,
    camera,
    playerRig,
    leftController,
    rightController,
    controllerMarker: controller2Marker,
    walls,
    playerRadius: 0.25,
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



// ============================================================
// MULTIPLAYER NETWORKING SETUP
// ============================================================

// Prompt user for their username

const username = "Player";

// Initialize network client
const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const network = new NetworkClient(`${wsProtocol}://${window.location.host}/ws`, username);
const remoteAvatars = new Map(); // Map<clientId, Avatar>

// Handle when our client connects and gets assigned an ID
network.on("connected", (data) => {
    console.log(
        `[Main] Connected as client ${data.clientId}, color: #${data.color.toString(16).padStart(6, "0")}`
    );
});

// Handle when a new remote user joins
network.on("user-joined", (user) => {
    console.log(`[Main] User joined: ${user.username} (ID: ${user.clientId})`);

    // Create avatar for the new user
    const avatar = new Avatar(user.clientId, user.username, user.color, scene);
    remoteAvatars.set(user.clientId, avatar);
});

// Handle when a remote user leaves
network.on("user-left", (clientId) => {
    console.log(`[Main] User left: ID ${clientId}`);

    const avatar = remoteAvatars.get(clientId);
    if (avatar) {
        avatar.dispose();
        remoteAvatars.delete(clientId);
    }
});

// Handle pose updates from remote users
network.on("pose-update", (data) => {
    const avatar = remoteAvatars.get(data.clientId);
    if (avatar) {
        avatar.updatePose(
            data.hmdPosition,
            data.hmdRotation,
            data.leftControllerMatrix,
            data.rightControllerMatrix
        );
    }
});

// ============================================================

window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});



renderer.setAnimationLoop(() => {
    movement.update();
    controls.update();

    // Send local player pose to all other players
    if (network && network.isConnected) {
        playerRig.updateMatrixWorld(true);
        network.sendPose(camera, leftController, rightController);
    }

    renderer.render(scene, camera);
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
    if (network) {
        network.disconnect();
    }
    remoteAvatars.forEach((avatar) => {
        avatar.dispose();
    });
});
