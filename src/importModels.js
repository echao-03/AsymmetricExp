import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default function callModels(sceneInput, grabVR) {
    const loader = new GLTFLoader();

    const modelUrl = new URL('./models/Table.glb', import.meta.url);
    loader.load(modelUrl.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, -0.8);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });

    loader.load(modelUrl.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, 4.3);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });

    loader.load(modelUrl.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, 2.1);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });

    loader.load(modelUrl.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-9, 0.6, -2.2);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });

    loader.load(modelUrl.href, function (gltf) {
        const model = gltf.scene;
        model.position.set(-24, 0.6, -9.2);
        model.rotateY(Math.PI / 2);
        model.scale.setScalar(0.7);
        sceneInput.add(model);
    }, undefined, function (error) {
        console.error(error);
    });
}