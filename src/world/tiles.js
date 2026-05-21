import * as THREE from "three";

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

// export function isWin(winTile) {
//   let collisionRig = new THREE.Box3().setFromObject(collisionBox);
//   let collisionTile = new THREE.Box3().setFromObject(winTile);
//   let collision = collisionRig.intersectsBox(collisionTile);

//   if (collision) {

//   } 

// }
