import * as THREE from "three";
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";

export default function tileUpdate(
  tiles,
  tilesOrder,
  tilesPlayer,
  collisionBox,
  isColliding,
) {
  // Correct answer to the tile order
  // update function to check collision between player and tiles
  // function to check if its correct, if not clear tileRow
  // tile should change color if correct order

  for (let i = 0; i < tiles.length; i++) {
    let collisionRig = new THREE.Box3().setFromObject(collisionBox);
    let collisionTile = new THREE.Box3().setFromObject(tiles[i]);
    let collision = collisionRig.intersectsBox(collisionTile);

    if (!collision && isColliding) {
      isColliding = false;
    }
    if (collision) {
      if (tilesPlayer.includes(tiles[i])) {
        continue;
      } else if (isColliding) {
        continue;
      } else {
        tilesPlayer.push(tiles[i]);
        tiles[i].material.color.set("green");
        let checkOrdering = tilesPlayer.every(
          (val, index) => val === tilesOrder[index],
        );
        if (!checkOrdering && tilesPlayer.length > 1) {
          for (let j = 0; j < tilesPlayer.length; j++) {
            tilesPlayer[j].material.color.set("white");
          }
          tilesPlayer.length = 0;
          isColliding = true;
        }
      }
    }
  }
}

export function isCorrect(tilesPlayer, tilesOrder, laserState) {
  if (tilesPlayer.length == 6) {
    laserState.lasers[2].setLasersActive(false)
    tilesPlayer.length = 0;
  }
}

export function isWin(winTile, collisionBox, winColliding, scene) {
  let collisionRig = new THREE.Box3().setFromObject(collisionBox);
  let collisionTile = new THREE.Box3().setFromObject(winTile);
  let collision = collisionRig.intersectsBox(collisionTile);

  if (collision && !winColliding) {
    console.log("in here");
    winTile.material.color.set("green");
    winColliding = true;

    // optional guard: only add once
    if (!scene.getObjectByName("winText")) {
      const fontLoader = new FontLoader();
      fontLoader.load("/fonts/NotoSansEthiopic.json", (font) => {
        const geometry = new TextGeometry("You Win!", {
          font,
          size: 0.4,
          depth: 0.08,
          curveSegments: 8,
          bevelEnabled: false,
        });
        geometry.computeBoundingBox();
        geometry.center();
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.name = "winText";
        textMesh.position.set(0, 1.3, -10.5);
        scene.add(textMesh);
      });
    }
  }

  return winColliding;
}

