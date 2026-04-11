export class Handbook {
    constructor({handbook, popupButton, closeButton}) {
        this.handbook = handbook;
        this.popupButton = popupButton;
        this.closeButton = closeButton;
    }

    init() {
        this.popupButton.addEventListener("click", () => this.show());
        this.closeButton.addEventListener("click", () => this.close());
    }

    show() {
        this.handbook.style.display = "flex";
    }

    close() {
        this.handbook.style.display = "none";
    }
}