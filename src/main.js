import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMap } from "./world/map";
import "./style.css";

const container = document.getElementById("app");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(15, 10, 15);


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

// for (let i = 0; i < 28; i += 1) {
//     const hue = 0.52 + (i / 28) * 0.2;
//     const material = new THREE.MeshStandardMaterial({
//         color: new THREE.Color().setHSL(hue, 0.55, 0.45),
//         roughness: 0.35,
//         metalness: 0.1
//     });

//     const cube = new THREE.Mesh(cubeGeometry, material);
//     const angle = (i / 28) * Math.PI * 2;
//     const radius = 2 + (i % 3) * 0.6;
//     cube.position.set(Math.cos(angle) * radius, 1 + (i % 4) * 0.3, Math.sin(angle) * radius);
//     cube.rotation.set(angle * 0.2, angle * 0.4, 0);
//     cubes.push(cube);
//     scene.add(cube);
// }

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();


renderer.setAnimationLoop(() => {
    // const t = clock.getElapsedTime();

    // for (let i = 0; i < cubes.length; i += 1) {
    //     const cube = cubes[i];
    //     cube.rotation.y += 0.004 + i * 0.00003;
    //     cube.position.y += Math.sin(t * 1.5 + i) * 0.0008;
    // }

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
