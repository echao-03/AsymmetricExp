import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMap } from "./world/map";
import { createVRMovement } from "./world/movement";
import { createMultiplayer } from "./world/multiplayer";
import "./style.css";
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";

const container = document.getElementById("app");
const mapContainer = document.getElementById("map-quadrant");
const cameraContainer = document.getElementById("top-right");
const cameraPrevButton = document.getElementById("camera-prev");
const cameraResetButton = document.getElementById("camera-reset");
const cameraNextButton = document.getElementById("camera-next");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);

const VRCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);

const mapCamera = new THREE.PerspectiveCamera(75, mapContainer.clientWidth / mapContainer.clientHeight, 0.1, 100);

let cameraNum = 0;

function setCameraNum(nextCameraNum) {
    cameraNum = ((nextCameraNum % 3) + 3) % 3;
}

cameraPrevButton?.addEventListener("click", () => {
    setCameraNum(cameraNum - 1);
});

cameraResetButton?.addEventListener("click", () => {
    setCameraNum(0);
});

cameraNextButton?.addEventListener("click", () => {
    setCameraNum(cameraNum + 1);
});

mapCamera.position.set(0, 15, 0);
mapCamera.lookAt(0, 1.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(VRCamera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);
controls.update();
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = false;

const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

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


console.log(cameraGroup);

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

        renderInContainer(mapCamera, mapContainer);             // top-left
        if (cameraNum == 0) {
            renderInContainer(intersectionCamera, cameraContainer); // top-right
        }

        else if (cameraNum == 1) {
            renderInContainer(R1Camera, cameraContainer); // top-right
        }

        else if (cameraNum == 2) {
            renderInContainer(R2Camera, cameraContainer); // top-right
        }

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
