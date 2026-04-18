import test from "node:test";
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

function makeLabelTexture(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#d6d6d6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // border
    ctx.strokeStyle = "#e4e4e4";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // text
    ctx.fillStyle = "#181818";
    ctx.font = "50px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

export default function callModels(sceneInput, grabVR) {
    const loader = new GLTFLoader();

    const tableURL = new URL('./models/Table.glb', import.meta.url);

    // Loading all table models into environments
    // Positioned at beginning of maze
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, -0.8);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });

    // Positioned at Lright room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, 4.3);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });
    // Positioned at Lright room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, 2.1);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });
    // Positioned at Tright room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, -2.2);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });
    // Position at Tleft room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-24, 0.6, -9.2);
        model.rotateY(Math.PI / 2);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });

    // Rendering 'papers' using a canvas to type out message

    const labelPaper_1 = makeLabelTexture("test test test");

    const materials = [
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +Y
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Y
        new THREE.MeshStandardMaterial({ map: labelPaper_1 }), // +Z (front)
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Z
    ]

    const testBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.01),
        materials,
    )

    testBox.position.set(0, 1, -0.5);
    testBox.rotateX(-0.8);

    grabVR.grabableObjects().push(testBox);

    sceneInput.add(testBox);




}