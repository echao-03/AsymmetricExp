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
    }

    init() {
        this.keys.forEach(key => {
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

        this.passcodes.set(this.laserState, "195653");
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

        if (currCode === this.passcodes.get(this.laserState)) {
            this.display.textContent = "ACCEPTED";
            if (this.secondaryDisplay) {
                this.secondaryDisplay.textContent = "ACCEPTED";
            }
            if (typeof this.onCodeAccepted === "function") {
                this.onCodeAccepted(currCode);
            }
            this.enteredCode = "";
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