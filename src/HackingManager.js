import * as THREE from "three"

export class HackingManger {
    constructor(droneRef, radar) {
        this.hackingButton = document.getElementById("hack-button");
        this.statusLabel = document.getElementById("laser-status");
        this.droneRef = droneRef;
        this.radar = radar;
    }

    init() {
        this.hackingButton.addEventListener("click", () => this.hack());
    }

    hack() {
        console.log("Hacking started...");
        this.droneRef.active = false; // Toggle drone active state

        const scanPosition = this.radar.mesh.getWorldPosition(new THREE.Vector3)
        scanPosition.x = scanPosition.x - 200;

        if (!this.droneRef.active && scanPosition.distanceTo(new THREE.Vector3(-24.5, 0.74, 8.)) < 2) {
            this.statusLabel.style.display = "none";
            if (this.statusLabel.style.display === "none") {
                this.statusLabel.style.display = "block";
                this.statusLabel.style.color = "#CE5353";
                this.statusLabel.textContent = "INACTIVE";
            }
        }
    }
}