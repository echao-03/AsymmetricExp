import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Drone } from "./Drone.js";
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";

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

  const light = new THREE.SpotLight(0xff0000, 3, 2, Math.PI, 0.3, 1);
  light.position.set(0, -0.1, 0);

  const target = new THREE.Object3D();
  target.position.set(0, -1, 0);

  droneModel.add(light);
  droneModel.add(target);
  light.target = target;

  droneModel.add(light);
  droneModel.add(target);
  light.target = target;

  return droneModel;
}

function makeJaggedPaperGeometry(width, height, teeth = 15, jagged = 0.04) {
  const shape = new THREE.Shape();
  const halfW = width / 2;
  const halfH = height / 2;

  shape.moveTo(-halfW, -halfH);
  shape.lineTo(halfW, -halfH);

  for (let i = 0; i <= teeth; i++) {
    const t = i / teeth;
    const y = -halfH + t * height;
    const x =
      halfW + (i === 0 || i === teeth ? 0 : i % 2 === 0 ? jagged : -jagged);
    shape.lineTo(x, y);
  }

  shape.lineTo(-halfW, halfH);
  shape.closePath();

  const geometry = new THREE.ShapeGeometry(shape);

  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const size = new THREE.Vector2(box.max.x - box.min.x, box.max.y - box.min.y);

  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv[i * 2 + 0] = (x - box.min.x) / size.x;
    uv[i * 2 + 1] = (y - box.min.y) / size.y;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geometry;
}

function makeJaggedPaperGeometryFlip(width, height, teeth = 15, jagged = 0.04) {
  const shape = new THREE.Shape();
  const halfW = width / 2;
  const halfH = height / 2;

  shape.moveTo(-halfW, -halfH);
  shape.lineTo(halfW, -halfH);

  shape.lineTo(halfW, halfH);

  for (let i = 0; i <= teeth; i++) {
    const t = i / teeth;
    const y = halfH - t * height;
    const x =
      -halfW + (i === 0 || i === teeth ? 0 : i % 2 === 0 ? jagged : -jagged);
    shape.lineTo(x, y);
  }

  shape.closePath();

  const geometry = new THREE.ShapeGeometry(shape);

  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const size = new THREE.Vector2(box.max.x - box.min.x, box.max.y - box.min.y);

  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv[i * 2 + 0] = (x - box.min.x) / size.x;
    uv[i * 2 + 1] = (y - box.min.y) / size.y;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geometry;
}

export default function callModels(sceneInput, grabVR, radar, hackingManager) {
  const loader = new GLTFLoader();

  const tableURL = new URL("./models/Table.glb", import.meta.url);
  const computerURL = new URL("./models/Simple_computer.glb", import.meta.url);

  // Loading all table models into environments
  // Positioned at beginning of maze
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-9, 0.6, -0.8);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Positioned at bright room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-9, 0.6, 4.3);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );
  // Positioned at bright room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-9, 0.6, 2.1);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Positioned at bright room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-13.9, 0.6, 6.25);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Position at bleft room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-24.5, 0.6, 8);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Position at bleft room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-28, 0.6, 8);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  loader.load(
    computerURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.rotation.set(0, Math.PI, -0.05);

      model.position.set(-24.5, 0.74, 8.2);
      model.scale.setScalar(1);
      sceneInput.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Positioned at Tright room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-9, 0.6, -2.2);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);

    },
    undefined,
    function (error) {
      console.error(error);
    },
  );
  // Position at Tleft room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-24, 0.6, -9.2);
      model.rotateY(Math.PI / 2);
      model.scale.setScalar(0.7);
      radar.scanableObjects.push(model);
      sceneInput.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Positioned at Tleft room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(-18, 0.6, -8);
      model.rotateY(Math.PI / 2);
      model.scale.setScalar(0.7);
      radar.scanableObjects.push(model);
      sceneInput.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Positioned at right room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(21, 0.6, 0);
      model.rotateY(Math.PI / 2);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(8.5, 0.6, 2);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Loading models for map camera, positioned in the copy of the maze
  // Positioned at beginning of maze
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(191, 0.6, -0.8);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
      model.visible = false;
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Positioned at bright room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(191, 0.6, 4.3);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
      model.visible = false;
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );
  // Positioned at bright room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(191, 0.6, 2.1);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
      model.visible = false;
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );
  // Positioned at Tright room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(191, 0.6, -2.2);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
      model.visible = false;
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );
  // Position at Tleft room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(176, 0.6, -9.2);
      model.rotateY(Math.PI / 2);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
      model.visible = false;
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Position at Tleft room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(176, 0.6, -9.2);
      model.rotateY(Math.PI / 2);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
      model.visible = false;

    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Positioned at Tleft room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(182, 0.6, -8);
      model.rotateY(Math.PI / 2);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
      model.visible = false;

    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Positioned at right room
  loader.load(
    tableURL.href,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(221, 0.6, 0);
      model.rotateY(Math.PI / 2);
      model.scale.setScalar(0.7);
      sceneInput.add(model);
      radar.scanableObjects.push(model);
      model.visible = false;

    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  // Rendering 'papers' using a canvas to type out message

  const masterPaper1 = [
    ["Dear J,"],
    ["Do not share this with anyone, f"],
    ["including the others workers that are"],
    ["The code for the master lock is"],
    ["                                           025"],
    ["DO NOT LET IT BE SEEN."],
    ["- E"],
  ];

  const masterPaper2 = [
    [""],
    [""],
    [""],
    [""],
    [" 598"],
    [""],
    ["P.S. Do not LOSE this "],
  ];

  const papers1 = [
    ["Dear J,"],
    [""],
    ["I left some things in the "],
    ["server room. "],
    ["Can you fetch it for me?"],
    ["P.S. The security drone is on,"],
    ["- E"],
  ];
  const papers2 = [
    ["Dear E,"],
    [""],
    ["It has come to my concern"],
    ["that the drone targets"],
    ["everyone."],
    [""],
    ["There should be a computer"],
    ["somewhere to disable it."]["- J"],
  ];
  const papers3 = [
    ["Dear E,"],
    [""],
    ["I did not see your things in"],
    ["the server room."],
    ["Perhaps the office room has it."],
    ["- J"],
  ];
  const papers4 = [
    ["Dear J,"],
    [""],
    ["I cannot access the office room"],
    ["I think the first 3 numbers"],
    ["to deactivate these lasers are"],
    ["195. I think if you look around,"],
    ["you might find the other numbers"],
    ["- E"],
  ];

  const papers5 = [
    ["Dear I,"],
    ["I don't understand why the"],
    ["fourth number of the code is"],
    ["6. Can it be like 2 or 4?"],
    ["Please email me back, thanks."],
    ["- K"],
  ];

  const papers6 = [
    ["Dear K,"],
    ["It's quite silly that the fifth"],
    ["number of the code is the number"],
    ["of cameras in the room."],
    ["I hope anybody intruding wouldn't"],
    ["know. :)"],
    ["- E"],
  ];

  const papers7 = [
    ["Dear E,"],
    ["Can you tell me why the sixth"],
    ["number of the code pertains to"],
    ["the number of days in a week?"],
    ["We need to talk to IT about"],
    ["beefing up our security."],
    ["- I"],
  ];

  const papersRroom = [
    ["Dear K"],
    [""],
    ["It has come to my attention"],
    ["that I found a piece of note with"],
    ["these weird symbols"],
    ["Please let me know if you can do"],
    ["anything about this."],
    ["- E"],
  ];

  const crypicLines = [
    ["1. 𝙹リᒷ"],
    ["2. ℸ∴𝙹"],
    ["3. ⍑∷"],
    ["4. ᒷᒷ ⎓"],
    ["5. ⚍∷ ⎓"],
    ["6. ╎⍊ᒷ"],
  ];

  const labelPaper_1 = makeLabelTexture(papers1);
  const labelPaper_2 = makeLabelTexture(papers2);
  const labelPaper_3 = makeLabelTexture(papers3);
  const labelPaper_4 = makeLabelTexture(papers4);
  const labelPaper_5 = makeLabelTexture(papers5);
  const labelPaper_6 = makeLabelTexture(papers6);
  const labelPaper_7 = makeLabelTexture(papers7);

  const labelMaster_1 = makeLabelTexture(masterPaper1);
  const labelMaster_2 = makeLabelTexture(masterPaper2);

  const mazePapers = [
    labelPaper_1,
    labelPaper_2,
    labelPaper_3,
    labelPaper_4,
    labelPaper_5,
    labelPaper_6,
    labelPaper_7,
  ];

  const RroomPaper_1 = makeLabelTexture(papersRroom);
  const paperArray = [];
  for (let i = 0; i < mazePapers.length; i++) {
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // +X
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // -X
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // +Y
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // -Y
      new THREE.MeshStandardMaterial({ map: mazePapers[i] }), // +Z (front)
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // -Z
    ];
    const renderPaper = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.3, 0.01),
      materials,
    );
    sceneInput.add(renderPaper);
    paperArray.push(renderPaper);
  }

  paperArray[0].position.set(-9, 0.9, -0.8);
  paperArray[0].rotateX(-0.8);

  paperArray[1].position.set(-9, 0.9, 2.1);
  paperArray[1].rotateX(-0.8);

  paperArray[2].position.set(-9, 0.9, -2.2);
  paperArray[2].rotateY(Math.PI);
  paperArray[2].rotateX(-0.8);

  paperArray[3].position.set(-24, 1, -6.7545);

  paperArray[4].position.set(-18.2, 0.8, -8);
  paperArray[4].rotateY(-Math.PI / 2);
  paperArray[4].rotateX(-0.8);

  paperArray[5].position.set(-13.9, 0.8, 6.25);
  paperArray[5].rotateY(Math.PI);
  paperArray[5].rotateX(-0.8);

  paperArray[6].position.set(-28, 0.8, 8);
  paperArray[6].rotateY(Math.PI);
  paperArray[6].rotateX(-0.8);

  const masterMaterial_1 = new THREE.MeshBasicMaterial({
    map: labelMaster_1,
    side: THREE.DoubleSide,
  });

  const master1 = new THREE.Mesh(
    makeJaggedPaperGeometry(0.2, 0.3, 12, 0.01),
    masterMaterial_1,
  );
  master1.position.set(-24.2, 0.8, -9.2);
  master1.rotateY(-Math.PI / 2);
  master1.rotateX(-0.8);

  const masterMaterial_2 = new THREE.MeshBasicMaterial({
    map: labelMaster_2,
    side: THREE.DoubleSide,
  });

  const master2 = new THREE.Mesh(
    makeJaggedPaperGeometryFlip(0.2, 0.3, 12, 0.01),
    masterMaterial_2,
  );

  const rightPaper1 = makeLabelTexture(papersRroom);
  const rightPaperMaterial = [
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // +X
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // -X
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // +Y
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // -Y
    new THREE.MeshStandardMaterial({ map: rightPaper1 }), // +Z (front)
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // -Z
  ];
  const rightPaper = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.3, 0.01),
    rightPaperMaterial,
  );

  rightPaper.position.set(8.2, 0.8, 2);
  rightPaper.rotateY(-Math.PI);
  rightPaper.rotateX(-0.8);
  sceneInput.add(rightPaper);

  const cryptic = makeLabelTexture(crypicLines);
  const crypticMaterial = [
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // +X
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // -X
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // +Y
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // -Y
    new THREE.MeshStandardMaterial({ map: cryptic }), // +Z (front)
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // -Z
  ];
  const crypicPaper = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.3, 0.01),
    crypticMaterial,
  );
  crypicPaper.position.set(8.8, 0.8, 2);
  crypicPaper.rotateY(-Math.PI);
  crypicPaper.rotateX(-0.8);
  sceneInput.add(crypicPaper);

  master2.position.set(21, 0.8, 0);
  master2.rotateY(-Math.PI / 2);
  master2.rotateX(-0.8);
  sceneInput.add(master1);
  sceneInput.add(master2);
  grabVR.grabableObjects().push(paperArray[0]);

  const fontLoader = new FontLoader();

  const addNumberText = (value, position) => {
    fontLoader.load("/fonts/NotoSansEthiopic.json", (font) => {
      const geometry = new TextGeometry(value, {
        font,
        size: 0.9,
        depth: 0.08,
        curveSegments: 8,
        bevelEnabled: false,
      });

      geometry.computeBoundingBox();
      geometry.center();

      const textMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
      );

      textMesh.position.set(...position);
      textMesh.rotation.x = -Math.PI / 2;
      sceneInput.add(textMesh);
    });
  };

  const numberPlacements = [
    ["5", [211, 1, -1]],
    ["4", [211, 1, 1]],
    ["6", [213, 1, -2]],
    ["3", [213, 1, 2]],
    ["1", [215, 1, -1]],
    ["2", [215, 1, 1]],
  ];

  numberPlacements.forEach(([value, position]) => {
    addNumberText(value, position);
  });


}
