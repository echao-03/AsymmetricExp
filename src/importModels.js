import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function makeLabelTexture(lines) {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#d6d6d6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // border


    // text
    ctx.fillStyle = "#181818";
    ctx.font = "35px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const lineHeight = 50;
    const leftMargin = 15;
    const startY = 30;

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], leftMargin, startY + i * lineHeight);
    }


    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

export async function callDrone(sceneInput) {
    const loader = new GLTFLoader();
    const droneURL = new URL("./models/vr_drone.glb", import.meta.url);

    const droneGltf = await loader.loadAsync(droneURL.href);
    const droneModel = droneGltf.scene;
    droneModel.position.set(-24, 0.6, -9.2);
    droneModel.scale.setScalar(0.3);
    sceneInput.add(droneModel);

    const light = new THREE.SpotLight(0xff0000, 5, 5, Math.PI / 4, 0.3, 1);
    light.position.set(0, 0.2, 0.5);

    const target = new THREE.Object3D();
    target.position.set(1, 0, 1);
    
    droneModel.add(light);
    droneModel.add(target);
    light.target = target;

    return droneModel;

}

export default function callModels(sceneInput, grabVR, radar) {

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

    // Positioned at bright room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, 4.3);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });
    // Positioned at bright room
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

    // Loading models for map camera, positioned in the copy of the maze
    // Positioned at beginning of maze
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(191, 0.6, -0.8);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
        radar.scanableObjects.push(model);
        model.visible = false;
    }, undefined, function (error) {
        console.error(error);
    });

    // Positioned at bright room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(191, 0.6, 4.3);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
        radar.scanableObjects.push(model);
        model.visible = false;
    }, undefined, function (error) {
        console.error(error);
    });
    // Positioned at bright room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(191, 0.6, 2.1);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
        radar.scanableObjects.push(model);
        model.visible = false;
    }, undefined, function (error) {
        console.error(error);
    });
    // Positioned at Tright room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(191, 0.6, -2.2);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
        radar.scanableObjects.push(model);
        model.visible = false;
    }, undefined, function (error) {
        console.error(error);
    });
    // Position at Tleft room
    loader.load(tableURL.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(176, 0.6, -9.2);
        model.rotateY(Math.PI / 2);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
        radar.scanableObjects.push(model);
        model.visible = false;
    }, undefined, function (error) {
        console.error(error);
    });

    // Rendering 'papers' using a canvas to type out message

    const papers1 = [['Dear J,'], [''], ['I left some things in the '], ['server room. '], ['Can you fetch it for me?'], ['P.S. The security drone is on.'], ['- E']];
    const papers2 = [['Dear E,'], [''], ['It has come to my concern'], ['that the drone targets'], ['everyone.'], [''], ['Use code 814597 to disable.'], ['- J']];
    const papers3 = [['Dear E,'], [''], ['I did not see your things in'], ['the server room.'], ['Perhaps the office room has it.'], ['- J']];
    const papers4 = [['Dear J,'], [''], ['I cannot access the office room'], ['I think the first 4 numbers'], ['to deactivate the lasers are'], ['1956. The last two numbers are'], ['the amount of cameras in this'], ['maze, and the amount of lasers.'], ['- E']];


    const labelPaper_1 = makeLabelTexture(papers1);
    const labelPaper_2 = makeLabelTexture(papers2);
    const labelPaper_3 = makeLabelTexture(papers3);
    const labelPaper_4 = makeLabelTexture(papers4);

    const materials1 = [
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +Y
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Y
        new THREE.MeshStandardMaterial({ map: labelPaper_1 }), // +Z (front)
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Z
    ]

    const materials2 = [
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +Y
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Y
        new THREE.MeshStandardMaterial({ map: labelPaper_2 }), // +Z (front)
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Z
    ]

    const materials3 = [
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +Y
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Y
        new THREE.MeshStandardMaterial({ map: labelPaper_3 }), // +Z (front)
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Z
    ]

    const materials4 = [
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -X
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // +Y
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Y
        new THREE.MeshStandardMaterial({ map: labelPaper_4 }), // +Z (front)
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // -Z
    ]

    const testBox1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.01),
        materials1,
    )
    const testBox2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.01),
        materials2,
    )

    const testBox3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.01),
        materials3,
    )

    const testBox4 = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.01),
        materials4,
    )

    testBox1.position.set(-9, 0.9, -0.8);
    testBox1.rotateX(-0.8);

    testBox2.position.set(-9, 0.9, 2.1);
    testBox2.rotateX(-0.8);

    testBox3.position.set(-9, 0.9, -2.2);
    testBox3.rotateY(Math.PI);
    testBox3.rotateX(-0.8);

    testBox4.position.set(-24, 1, -6.7545);


    grabVR.grabableObjects().push(testBox1);

    sceneInput.add(testBox1);
    sceneInput.add(testBox2);
    sceneInput.add(testBox3);
    sceneInput.add(testBox4);



}