# AsymmetricExp

<img width="1516" height="865" alt="capstone4" src="https://github.com/user-attachments/assets/2d248ea8-fe51-4637-8355-ab88e7186ed5" />

## Introduction
AsymmetricExp is a web-based, asymmetric multiplayer experience that pairs a fully immersed VR user with a traditional desktop PC player within a single, shared environment. Built entirely on open web standards using Three.js, WebXR, and WebSockets, the game transforms hardware differences into a collaborative mechanic. The VR user must navigate a complex 3D maze using spatial movement, while the desktop user manages a command interface featuring security camera feeds, a top-down 3D map, and a handbook that lets them store recently gathered information. Live user testing demonstrated that the platform successfully establishes a cross-modality synchronization loop that fosters high levels of team communication and engagement. This experience shows that modern web technologies can host cross-platform, accessible, and inclusive multiplayer experiences without platform-dependent software. 

## Architecture Overview
- ***Backend***: Uses a WebSocket server, i.e., Express.js; Connects both clients using a server that coordinates state synchronization. Backend also consists of a client manager that handles requests to the server, as well as broadcasting messages to clients if an action occurs that requires both clients' attention
- ***Frontend***:
    - VR Client: Runs WebXR, handles controller input, movement, and game logic
    - Desktop Client: Multi-viewport interface for both monitoring and control

## How To Use
**NOTE: Make sure both headset and desktop are on the same Wi-Fi network. Connected on different network will not work (at the moment).**
### Desktop
1. Pull the repository onto your local machine and run:
   ```
   npm install
   ```
2. Once installation is complete, open another tab on your terminal and navigate to `/server` and run:
   ```
   npm install
   ```
3. Once the server installation is complate, run:
   ```
   npm start
   ```
4.  `cd ..` back to the main directory of AsymmericExp and run:
```
npm run dev
```
5. Ctrl + click on the IP address that is given on the terminal
   **Note:** If there is more than one IP address, use the IP that correlates to your Wireless adapter Wi-Fi

### Headset
1. Open the Web Explorer/Internet app and use the IP address and port number that the desktop user is currently on
2. Hover over `Start VR` on the bottom of the screen and press the trigger button to start the experience 

## Gameplay / Controls
### Desktop
The desktop user will have four different panels they can interact with. The top-left panel represents a top-down view of the VR user in the environment, which shows their current position as well. The top-right panel contains a camera feed that displays the VR user's position and their orientation, while emulating as a security camera. The bottom-left panel consists a set of utilities that the desktop user can engage with. The keypad utility allows the desktop user to input a 6-digit code that can unlock certain areas. The handbook utility contains both a dictionary of useful information that relates to each area of the environment, as well as space for the desktop user to take notes. Finally, the bottom-right panel contains the description of each utility features. 

### Headset
To navigate around the environment, push the thumbstick up on the right controller to navigate through the environment. To grab any objects-of-interest, use the grip button and hover your 'arms' right next to it. To realign the position, press and hold the controller's 'home' button ie. For Meta Quest, the Meta button. 

## Project Structure
```

```




