import makeDraggable from "./draggable";
import { Keypad } from "./keypad";
import { Handbook } from "./handbook";

export default function initPopups({ requiredCode = "", onCodeAccepted = null } = {}) {
    // HTML elements for popups
    const keypad = document.getElementById("keypad");
    const handbookButton = document.getElementById("handbook-button");
    const handbook = document.getElementById("handbook");
    const handbookClose = document.getElementById("handbook-close");
    const keypadButton = document.getElementById("keypad-button");
    const keypadClose = document.getElementById("keypad-close");
    const keys = document.querySelectorAll(".key");
    const smallKeys = document.querySelectorAll(".key-small");
    const keypadDisplay = document.getElementById("num-view-bar");
    const keypadDisplaySmall = document.getElementById("num-view-bar-button");
    const clearButton = document.getElementById("clear-button");
    const clearButtonSmall = document.getElementById("clear-button-small");
    const acceptButton = document.getElementById("accept-button");
    const acceptButtonSmall = document.getElementById("accept-button-small");

    // Init Keypad
    const keypadObj = new Keypad({
        keypad: keypad,
        keys: keys,
        secondaryKeys: smallKeys,
        clearButton: clearButton,
        secondaryClearButton: clearButtonSmall,
        display: keypadDisplay,
        secondaryDisplay: keypadDisplaySmall,
        maxLength: 6,
        closeButton: keypadClose,
        acceptButton: acceptButton,
        popupButton: keypadButton,
        secondaryAcceptButton: acceptButtonSmall,
        requiredCode,
        onCodeAccepted,
    });

    // Init handbook
    const handbookObj = new Handbook({
        handbook: handbook,
        popupButton: handbookButton,
        closeButton: handbookClose
    });

    // Call init() for handbook and keypad for event listeners
    keypadObj.init();
    handbookObj.init();

    // Allow popups to be dragged
    makeDraggable(keypadObj.keypad, ".key");
    makeDraggable(handbookObj.handbook, "textarea");
}