import * as THREE from "three";
import { Laser } from "../src/lasers.js";
export class Keypad {
  constructor({
    keypad,
    keys,
    clearButton,
    display,
    maxLength = 6,
    closeButton,
    acceptButton,
    popupButton,
    secondaryKeys = [],
    secondaryClearButton = null,
    secondaryDisplay = null,
    secondaryAcceptButton = null,
    requiredCode = "",
    onCodeAccepted = null,
    laserState,
    radar,
    multiplayer,
  }) {
    this.keypad = keypad;
    this.keys = keys;
    this.clearButton = clearButton;
    this.display = display;
    this.maxLength = maxLength;
    this.enteredCode = "";
    this.closeButton = closeButton;
    this.acceptButton = acceptButton;
    this.popupButton = popupButton;
    this.requiredCode = requiredCode;
    this.onCodeAccepted = onCodeAccepted;
    this.passcodes = new Map();
    this.laserState = laserState;
    this.disableObjects = [laserState.lasers[0], laserState.lasers[1]];
    this.radar = radar;
    this.multiplayer = multiplayer;
  }

  init() {
    this.keys.forEach((key) => {
      key.addEventListener("click", () => this.handleKeyPress(key));
    });

    this.clearButton.addEventListener("click", () => this.reset());
    if (this.secondaryClearButton) {
      this.secondaryClearButton.addEventListener("click", () => this.reset());
    }
    this.closeButton.addEventListener("click", () => this.close());
    this.acceptButton.addEventListener("click", () => this.submit());
    if (this.secondaryAcceptButton) {
      this.secondaryAcceptButton.addEventListener("click", () => this.submit());
    }
    this.popupButton.addEventListener("click", () => this.show());
    this.updateDisplay();

    this.passcodes.set(this.laserState.lasers[0], "195657");
    this.passcodes.set(this.laserState.lasers[1], "105326");
  }

  handleKeyPress(key) {
    if (this.enteredCode.length >= this.maxLength) return;

    const keyValue = this.getKeyValue(key);
    if (!keyValue || keyValue === "Accept" || keyValue === "Clear") return;

    this.enteredCode += keyValue;
    this.updateDisplay();
  }

  getKeyValue(key) {
    const textValue = (key.textContent || "").trim();
    if (textValue) {
      return textValue;
    }

    const idValue = key.id || "";
    if (/^\d$/.test(idValue)) {
      return idValue;
    }

    if (idValue.includes("accept")) return "Accept";
    if (idValue.includes("clear")) return "Clear";
    return "";
  }

  updateDisplay() {
    const text = this.enteredCode || "ENTER CODE";
    this.display.textContent = text;
    if (this.secondaryDisplay) {
      this.secondaryDisplay.textContent = text;
    }
  }

  reset() {
    this.enteredCode = "";
    this.updateDisplay();
  }

  getCode() {
    return this.enteredCode;
  }

  close() {
    this.keypad.style.display = "none";
    this.updateDisplay();
  }

  submit() {
    const currCode = this.getCode();

    if (!currCode) {
      this.updateDisplay();
      return;
    }

    const playerPos = this.radar.mesh.getWorldPosition(new THREE.Vector3());
    playerPos.x = playerPos.x - 200;
    const inRange = [];
    this.disableObjects.forEach((obj) => {
      const objPos = obj.mesh.getWorldPosition(new THREE.Vector3());
      if (playerPos.distanceTo(objPos) < 3) {
        inRange.push(obj);
      }
    });

    if (currCode === this.passcodes.get(inRange[0])) {
      this.display.textContent = "ACCEPTED";
      if (this.secondaryDisplay) {
        this.secondaryDisplay.textContent = "ACCEPTED";
      }
      inRange[0].setLasersActive(false);
      this.enteredCode = "";
      ``;
      if (
        this.multiplayer &&
        this.multiplayer.network &&
        this.multiplayer.network.isConnected
      ) {
        console.log(inRange[0]);
        this.multiplayer.network.send({
          type: "laser-state",
          laser: inRange[0],
          active: false,
        });
      }

      return;
    }

    this.display.textContent = "DENIED";
    if (this.secondaryDisplay) {
      this.secondaryDisplay.textContent = "DENIED";
    }
    this.enteredCode = "";
  }

  show() {
    this.keypad.style.display = "flex";
  }
}
