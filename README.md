# AsymmetricExp

## Overview
AsymmetricExp is a web-based, asymmetric multiplayer experience that pairs a fully immersed VR user with a traditional desktop PC player within a single, shared environment. Built entirely on open web standards using Three.js, WebXR, and WebSockets, the game transforms hardware differences into a collaborative mechanic. The VR user must navigate a complex 3D maze using spatial movement, while the desktop user manages a command interface featuring security camera feeds, a top-down 3D map, and a handbook that lets them store recently gathered information. Live user testing demonstrated that the platform successfully establishes a cross-modality synchronization loop that fosters high levels of team communication and engagement. This experience shows that modern web technologies can host cross-platform, accessible, and inclusive multiplayer experiences without platform-dependent software. 

## Architecture Overview
- ***Backend***: Uses a WebSocket server ie. Express.js; Connects both clients using a server that coordinates state synchronization. Backend also consists of a client manager that handles requests to the server, as well as broadcasting messages to clients if an action occurs that requires both clients' attention
- ***Frontend***:
    - VR Client: Runs WebXR, handles controller input, movement, and game logic
    - Desktop Client: Multi-viewport interface for both monitoring and control
- 

