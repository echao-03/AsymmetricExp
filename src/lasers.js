export default function setLasersActive(isActive, laserState) {
    laserState.active = isActive;
    laserState.boxes.forEach((laser) => {
    laser.visible = isActive;
  });
}