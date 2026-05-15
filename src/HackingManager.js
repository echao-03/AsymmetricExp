import * as THREE from "three"

export class HackingManger {
    constructor(droneRef) {
        this.hackingButton = document.getElementById("hack-button");
        this.statusLabel = document.getElementById("laser-status");
        this.droneRef = droneRef;
    }

    init() {
        this.hackingButton.addEventListener("click", () => this.hack());
    }

    hack() {
        console.log("Hacking started...");
        this.droneRef.active = false; // Toggle drone active state

        if (!this.droneRef.active) {
            this.statusLabel.style.display = "none";
            if (this.statusLabel.style.display === "none") {
                this.statusLabel.style.display = "block";
                this.statusLabel.style.color = "#CE5353";
                this.statusLabel.textContent = "INACTIVE";
            }
        }
    }
}