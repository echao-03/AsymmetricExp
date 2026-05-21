import NetworkClient from "../NetworkClient.js";
import Avatar from "../Avatar.js";
import { Laser } from "../lasers.js";

export function createMultiplayer({ scene, username = "Player", playerClone, laserState, cameraManager, mapCamera }) {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const network = new NetworkClient(`${wsProtocol}://${window.location.host}/ws`, username);
    const remoteAvatars = new Map();

    network.on("connected", (data) => {
        console.log(
            `[Main] Connected as client ${data.clientId}, color: #${data.color.toString(16).padStart(6, "0")}`
        );
    });

    network.on("user-joined", (user) => {
        console.log(`[Main] User joined: ${user.username} (ID: ${user.clientId})`);

        const avatar = new Avatar(user.clientId, user.username, user.color, scene);
        remoteAvatars.set(user.clientId, avatar);
    });

    network.on("user-left", (clientId) => {
        console.log(`[Main] User left: ID ${clientId}`);

        const avatar = remoteAvatars.get(clientId);
        if (avatar) {
            avatar.dispose();
            remoteAvatars.delete(clientId);
        }
    });

    network.on("pose-update", (data) => {
        const avatar = remoteAvatars.get(data.clientId);
        if (avatar) {
            avatar.updatePose(
                data.hmdPosition,
                data.hmdRotation,
                data.leftControllerMatrix,
                data.rightControllerMatrix
            );

            playerClone.position.x = data.hmdPosition[0] + 200;
            playerClone.position.z = data.hmdPosition[2];

            if(playerClone.position.x > 207){
                cameraManager.changeRoom(2);
                mapCamera.position.set(211, 10, 0)
                mapCamera.lookAt(211, 0, 0)

            }
            else if (playerClone.position.x < 193) {
                cameraManager.changeRoom(1);
                mapCamera.position.set(184, 18, 0);
                mapCamera.lookAt(184, 0, 0);
            }
            else {
                cameraManager.changeRoom(0);
                mapCamera.position.set(200, 6, 0);
                mapCamera.lookAt(200, 0, 0);
            }

        }
    });

    network.on("laser-state", (data) => {
        const laser = laserState.lasers.find(
            laser => laser.laserId === data.laserId
        );
        console.log(data);
        console.log(laser);
        if (laser) {
            laser.setLasersActive(data.active);
        }


    });

    function updatePose(camera, leftController, rightController, playerRig, playerClone) {
        if (!network || !network.isConnected) {
            return;
        }

        playerRig.updateMatrixWorld(true);
        network.sendPose(camera, leftController, rightController, playerClone);
    }

    function dispose() {
        if (network) {
            network.disconnect();
        }

        remoteAvatars.forEach((avatar) => {
            avatar.dispose();
        });
        remoteAvatars.clear();
    }

    return {
        network,
        remoteAvatars,
        updatePose,
        dispose,
    };
}
