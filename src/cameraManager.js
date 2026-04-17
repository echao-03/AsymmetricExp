export class CameraManager {
    constructor({ cameraContainer, prevButton, resetButton, nextButton, roomCameras }) {
        this.cameraContainer = cameraContainer;
        this.prevButton = prevButton;
        this.resetButton = resetButton;
        this.nextButton = nextButton;
        this.roomCameras = roomCameras;
        this.cameraNum = 0;
        this.roomNum = 0 // Need to find a way to change roomNum, maybe make function setRoomNum() when player moves to diff rooms

        this.prevButton?.addEventListener("click", () => this.prevCamera());
        this.resetButton?.addEventListener("click", () => this.resetCamera());
        this.nextButton?.addEventListener("click", () => this.nextCamera());
    }

    setCameraNum(nextCameraNum) {
        this.cameraNum = ((nextCameraNum % 3) + 3) % 3;
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
}