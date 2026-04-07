import NetworkClient from "../NetworkClient.js";
import Avatar from "../Avatar.js";

export function createMultiplayer({ scene, username = "Player" }) {
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
        }
    });

    function updatePose(camera, leftController, rightController, playerRig) {
        if (!network || !network.isConnected) {
            return;
        }

        playerRig.updateMatrixWorld(true);
        network.sendPose(camera, leftController, rightController);
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
