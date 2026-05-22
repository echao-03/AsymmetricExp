export class CameraManager {
    constructor({cameraContainer, prevButton, resetButton, nextButton, roomCameras}) {
        this.cameraContainer = cameraContainer;
        this.prevButton = prevButton;
        this.resetButton = resetButton;
        this.nextButton = nextButton;
        this.roomCameras = roomCameras;
        this.cameraNum = 0;
        this.roomNum = 0;

        this.prevButton?.addEventListener("click", () => this.prevCamera());
        this.resetButton?.addEventListener("click", () => this.resetCamera());
        this.nextButton?.addEventListener("click", () => this.nextCamera());

        this.cameraContainer = document.getElementById("camera-quadrant");
        this.cameraLabel = document.getElementById("camera-label");
    }

    setCameraNum(nextCameraNum) {
        this.cameraNum = ((nextCameraNum % this.roomCameras[this.roomNum].length) + this.roomCameras[this.roomNum].length) % this.roomCameras[this.roomNum].length;
    }

    prevCamera() {
        console.log("Moving to previous camera...")
        this.setCameraNum(this.cameraNum - 1);
    }

    resetCamera() {
        console.log("Resetting camera...")
        this.setCameraNum(0);
    }

    nextCamera() {
        console.log("Moving to next camera...")
        this.setCameraNum(this.cameraNum + 1);
    }

    getActiveCamera() {

        switch (this.roomNum) {
            case 0:
                this.cameraContainer.style.border = "2px solid red";
                this.cameraLabel.textContent = "Main Laser";
                break;
            
            case 1:
                switch (this.cameraNum) {
                    case 0:
                        this.cameraContainer.style.border = "2px solid red";
                        this.cameraLabel.textContent = "Main Hall";
                        break;
                    case 1:
                        this.cameraContainer.style.border = "2px solid blue";
                        this.cameraLabel.textContent = "Office";
                        break;
                    case 2:
                        this.cameraContainer.style.border = "2px solid green";
                        this.cameraLabel.textContent = "Storage";
                        break;
                    case 3:
                        this.cameraContainer.style.border = "2px solid cyan";
                        this.cameraLabel.textContent = "Conference";
                        break;
                    case 4:
                        this.cameraContainer.style.border = "2px solid orange";
                        this.cameraLabel.textContent = "Storage";
                        break;
                }
                break;
            case 2:
                switch (this.cameraNum) {
                    case 0:
                        this.cameraContainer.style.border = "2px solid red";
                        this.cameraLabel.textContent = "Security Camera 1";
                        break;
                    case 1:
                        this.cameraContainer.style.border = "2px solid blue";
                        this.cameraLabel.textContent = "Security Camera 2";
                        break;
                }
        }
        return this.roomCameras[this.roomNum][this.cameraNum];
    }

    changeRoom(newRoom) {
        this.setCameraNum(0);
        this.roomNum = newRoom;
    }
}