export class Keypad{
    constructor({keypad, keys, clearButton, display, maxLength = 6, closeButton, popupButton}) {
        this.keypad = keypad;
        this.keys = keys;
        this.clearButton = clearButton;
        this.display = display;
        this.maxLength = maxLength;
        this.enteredCode = "";
        this.closeButton = closeButton;
        this.popupButton = popupButton;
    }

    init() {
        this.keys.forEach(key => {
            key.addEventListener("click", () => this.handleKeyPress(key));
        });

        this.clearButton.addEventListener("click", () => this.reset());
        this.closeButton.addEventListener("click", () => this.close());
        this.popupButton.addEventListener("click", () => this.show());
    }

    handleKeyPress(key) {
        if (this.enteredCode.length >= this.maxLength) return;

        if (key.textContent === "Accept") return;
        this.enteredCode += key.textContent;
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.display.textContent = this.enteredCode || "ENTER CODE";
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
        this.display.textContent = "ENTER CODE";
    }

    show() {
        this.keypad.style.display = "flex";
    }
}