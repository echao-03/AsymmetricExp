import * as THREE from "three";

export function createOverlay(scene) {
  const width = 100;
  const height = 30;

  // --- Create canvas ---
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  // --- Helper: convert world → canvas coords ---
  function worldToCanvas(x, z) {
    return {
      x: (x + width / 2) / width * canvas.width,
      y: (z + height / 2) / height * canvas.height
    };
  }

  // --- Draw a section with label ---
  function drawSection(x, z, w, h, color) {
    const topLeft = worldToCanvas(x - w / 2, z - h / 2);
    const bottomRight = worldToCanvas(x + w / 2, z + h / 2);

    const rectWidth = bottomRight.x - topLeft.x;
    const rectHeight = bottomRight.y - topLeft.y;

    // draw area
    ctx.fillStyle = color;
    ctx.fillRect(topLeft.x, topLeft.y, rectWidth, rectHeight);
  }

  // --- Example sections ---
  drawSection(-14, -3, 5, 5, "rgba(0,255,0,0.1)");
  drawSection(-19.8, -3, 6.5, 5,"rgba(0, 17, 255, 0.1)");
  drawSection(-21.5, 2.5, 3, 6,"rgba(255, 123, 0, 0.1)");
  drawSection(-18.5, 3, 3, 5,"rgba(234, 0, 255, 0.1)");
  drawSection(-14.25, 3, 5.5, 5,"rgba(0, 225, 255, 0.1)");
  drawSection(-15.75, 0, 8.5, 1,"rgba(255, 0, 0, 0.1)");



  const texture = new THREE.CanvasTexture(canvas);

  // --- Overlay plane ---
  const overlayGeometry = new THREE.PlaneGeometry(width, height);

  const overlayMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  });

  const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);

  // IMPORTANT: keep it just above the floor
  overlay.position.set(0, 10, 0);
  overlay.rotation.x = -Math.PI / 2;

  scene.add(overlay);

  // --- Return useful tools ---
  return {
    overlay,
    ctx,
    canvas,
    texture,
    drawSection
  };
}