/**
 * WebSocket server for multiplayer VR + Desktop synchronization
 * Runs on localhost:8080
 * 
 * Message types:
 * - user-join: Client joins with username
 * - user-list: Server sends list of other users
 * - pose-update: Client sends pose (HMD + controllers)
 * - remote-pose: Server broadcasts other players' poses
 * - user-connected: Broadcasts when new user joins
 * - user-disconnected: Broadcasts when user leaves
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import ClientManager from './clients.js';

const PORT = 8080;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clientManager = new ClientManager();

/**
 * Handle new WebSocket connections
 */
wss.on('connection', (ws) => {
    console.log('[CONNECT] New client connected');
    let clientId = null;

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleMessage(ws, message);
        } catch (error) {
            console.error('[ERROR] Failed to parse message:', error);
        }
    });

    ws.on('close', () => {
        if (clientId !== null) {
            const client = clientManager.getClient(clientId);
            if (client) {
                console.log(`[DISCONNECT] User "${client.username}" (ID: ${clientId}) disconnected`);
                clientManager.removeClient(clientId);

                // Broadcast disconnect to remaining clients
                clientManager.broadcastToAll({
                    type: 'user-disconnected',
                    clientId,
                });
            }
        }
    });

    ws.on('error', (error) => {
        console.error('[ERROR] WebSocket error:', error);
    });

    /**
     * Route incoming messages
     */
    function handleMessage(ws, message) {
        const { type } = message;

        switch (type) {
            case 'user-join':
                clientId = handleUserJoin(ws, message);
                break;

            case 'pose-update':
                handlePoseUpdate(clientId, message);
                break;

            default:
                console.warn(`[WARN] Unknown message type: ${type}`);
        }
    }
});

/**
 * Handle new user joining
 */
function handleUserJoin(ws, message) {
    const { username } = message;

    if (!username) {
        ws.send(JSON.stringify({ type: 'error', message: 'Username required' }));
        return null;
    }

    const { clientId, color } = clientManager.addClient(ws, username);

    console.log(
        `[JOIN] User "${username}" joined with ID ${clientId}, color: #${color.toString(16).padStart(6, '0')}`
    );

    // Send this client its own ID and current user list
    ws.send(
        JSON.stringify({
            type: 'user-assigned',
            clientId,
            color,
        })
    );

    // Send this client all existing users
    const otherUsers = clientManager.getOtherClients(clientId).map((client) => ({
        clientId: client.clientId,
        username: client.username,
        color: client.color,
        pose: client.pose,
    }));

    ws.send(
        JSON.stringify({
            type: 'user-list',
            users: otherUsers,
        })
    );

    // Broadcast to all others that new user joined
    clientManager.broadcastToOthers(clientId, {
        type: 'user-connected',
        clientId,
        username,
        color,
    });

    return clientId;
}

/**
 * Handle pose updates from client
 */
function handlePoseUpdate(clientId, message) {
    const { hmdPosition, hmdRotation, leftControllerMatrix, rightControllerMatrix } = message;

    if (clientId === null) {
        return;
    }

    // Update the client's pose in manager
    clientManager.updatePose(clientId, {
        hmdPosition,
        hmdRotation,
        leftControllerMatrix,
        rightControllerMatrix,
    });

    // Broadcast this pose to all other clients
    clientManager.broadcastToOthers(clientId, {
        type: 'remote-pose',
        clientId,
        hmdPosition,
        hmdRotation,
        leftControllerMatrix,
        rightControllerMatrix,
    });
}

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', clients: clientManager.getAllClients().length });
});

/**
 * Start server
 */
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║     AsymmetricExp Multiplayer WebSocket Server            ║
║                                                           ║
║  WebSocket: ws://localhost:${PORT}                           ║
║  Health:    http://localhost:${PORT}/health                  ║
║                                                           ║
║  Waiting for connections...                              ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
