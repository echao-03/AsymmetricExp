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
        return this.roomCameras[this.roomNum][this.cameraNum];
    }

    changeRoom(newRoom) {
        this.setCameraNum(0);
        this.roomNum = newRoom;
    }
}