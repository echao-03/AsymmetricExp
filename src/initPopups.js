import makeDraggable from "./draggable";
import { Keypad } from "./keypad";
import { Handbook } from "./handbook";

export default function initPopups() {
    // HTML elements for popups
    const keypad = document.getElementById("keypad");
    const handbookButton = document.getElementById("handbook-button");
    const handbook = document.getElementById("handbook");
    const handbookClose = document.getElementById("handbook-close");
    const keypadButton = document.getElementById("keypad-button");
    const keypadClose = document.getElementById("keypad-close");
    const keys = document.querySelectorAll(".key");
    const keypadDisplay = document.getElementById("num-view-bar");
    const clearButton = document.getElementById("clear-button");
    const acceptButton =  document.getElementById("accept-button");

    // Init Keypad
    const keypadObj = new Keypad({
        keypad: keypad,
        keys: keys,
        clearButton: clearButton,
        display: keypadDisplay,
        maxLength: 6,
        closeButton: keypadClose,
        acceptButton: acceptButton,
        popupButton: keypadButton
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