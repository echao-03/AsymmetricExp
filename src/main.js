import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMap } from "./world/map";
import { createVRMovement } from "./world/movement";
import { createMultiplayer } from "./world/multiplayer";
import "./style.css";
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";
import { CameraManager } from "./cameraManager";
import { Keypad } from "./keypad";

const container = document.getElementById("app");
const mapContainer = document.getElementById("map-quadrant");
const cameraContainer = document.getElementById("camera-quadrant");
const cameraPrevButton = document.getElementById("prev-button");
const cameraResetButton = document.getElementById("reset-button");
const cameraNextButton = document.getElementById("next-button");
const keypad = document.getElementById("keypad");
const handbookButton = document.getElementById("handbook-button");
const handbook = document.getElementById("handbook");
const handbookClose = document.getElementById("handbook-close");
const keypadButton = document.getElementById("keypad-button");
const keypadClose = document.getElementById("keypad-close");
const keys = document.querySelectorAll(".key");
const keypadDisplay = document.getElementById("num-view-bar");
const clearButton = document.getElementById("clear-button");

// Audio Loader
const buttonPush = new Audio("./audio/ButtonPush.wav");


// Init Keypad
const keypadObj = new Keypad({
    keypad: keypad,
    keys: keys,
    clearButton: clearButton,
    display: keypadDisplay,
    maxLength: 6,
    closeButton: keypadClose,
    popupButton: keypadButton
});

keypadObj.init();

handbookButton.addEventListener("click", () => {
    handbook.style.display = "flex"; // show popup
});

handbookClose.addEventListener("click", () => {
    handbook.style.display = "none"; // hide popup
});

makeDraggable(keypadObj.keypad, ".key");
makeDraggable(handbook, "textarea");

// Making popups draggable
function makeDraggable(element, exceptionSelector){
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener("mousedown", (e) => {
        if (e.target.closest(exceptionSelector)) return;

        isDragging = true;

        // Calculate offset between mouse and keypad top-left corner
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        element.classList.add("dragging");
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        // Move keypad to new mouse position minus the initial offset
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
        element.style.bottom = "auto"; // override bottom if previously set
        element.style.transform = "none"; // remove translateX(-50%)
    });

    window.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            element.classList.remove("dragging");
        }
    });
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);

const VRCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);

const mapCamera = new THREE.PerspectiveCamera(75, mapContainer.clientWidth / mapContainer.clientHeight, 0.1, 100);

const cameraGroup = new THREE.ArrayCamera();
const intersectionCamera = new THREE.PerspectiveCamera(75, cameraContainer.clientWidth / cameraContainer.clientHeight, 0.1, 100)
intersectionCamera.position.set(-1, 2.5, -1);
intersectionCamera.lookAt(1, 0, 2);

const R1Camera = new THREE.PerspectiveCamera(75, cameraContainer.clientWidth / cameraContainer.clientHeight, 0.1, 100)
R1Camera.position.set(9, 2, 0);
R1Camera.lookAt(1, 1, 0);


const R2Camera = new THREE.PerspectiveCamera(75, cameraContainer.clientWidth / cameraContainer.clientHeight, 0.1, 100)
R2Camera.position.set(-9, 2, 0);
R2Camera.lookAt(1, 1, 0);

const cameras = [R1Camera, intersectionCamera, R2Camera];

const cameraManager = new CameraManager({
    cameraContainer,
    prevButton: cameraPrevButton,
    resetButton: cameraResetButton,
    nextButton: cameraNextButton,
    cameras: cameras,
});

mapCamera.position.set(0, 15, 0);
mapCamera.lookAt(0, 1.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

console.log(container); // should print <div id="app">...</div>
console.log(renderer.domElement); // should print <canvas> element

const controls = new OrbitControls(VRCamera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);
controls.update();
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = false;

const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);


const playerRig = new THREE.Group();
playerRig.add(VRCamera);
playerRig.children[0].rotateY(20);
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

const { walls } = createMap(scene);

const movement = createVRMovement({
    renderer,
    camera: VRCamera,
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


renderer.setAnimationLoop(() => {
    movement.update();
    controls.update();
    multiplayer.updatePose(VRCamera, leftController, rightController, playerRig);

    if (renderer.xr.isPresenting) {
        renderer.render(scene, VRCamera);
    }

    else {

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
