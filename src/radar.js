import * as THREE from "three";

export class Radar {
  constructor(parent, radius, innerRadius, scanableObjects = []) {
    this.radius = radius;
    this.innerRadius = innerRadius;
    this.scanButton = document.getElementById("scan-button");
    this.scanableObjects = scanableObjects;

    this.idleColor = 0xffffff;
    this.activeColor = 0x00ff00;

    this.radarGroup = new THREE.Group();
    parent.add(this.radarGroup);

    // Create geo for pulse effect
    const pulseGeo = new THREE.RingGeometry(2.9, 3.1, 64);

    const pulseMat = new THREE.MeshBasicMaterial({
    color: this.idleColor,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
    });

    this.pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    this.pulseMesh.rotation.x = -Math.PI / 2;
    this.pulseMesh.position.y = 0.1;

    this.pulseSpeed = 0.5;
    this.pulseScale = 0;
    this.pulseResetAt = 1;

    // Create geo for radar circle range
    const geometry = new THREE.RingGeometry(2.9, 3.1, 64);
    const material = new THREE.MeshBasicMaterial({
      color: this.idleColor,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(0, 0, 0);

    this.radarGroup.add(this.pulseMesh);
    this.radarGroup.add(this.mesh);

    this.scanButton.addEventListener("click", () => this.scan());

  }

  scan() {
    console.log("Scanning...");
      this.pulseMesh.material.color.set(this.activeColor);
      this.mesh.material.color.set(this.activeColor);

    const center = this.mesh.getWorldPosition(new THREE.Vector3());
    const detected = [];

    this.scanableObjects.forEach(obj => {
      const pos = obj.getWorldPosition(new THREE.Vector3());
      const dist = center.distanceTo(pos);

      if (dist <= this.radius) {
        detected.push(obj);
      }
    });

    console.log(detected)

    detected.forEach(obj => {
      obj.visible = true;
    });

    clearTimeout(this.resetColorTimeout);

    this.resetColorTimeout = setTimeout(() => {
        this.pulseMesh.material.color.set(this.idleColor);
        this.mesh.material.color.set(this.idleColor);
        detected.forEach(obj => {
            obj.visible = false;
        });

    }, 3000);
  }

    update(deltaTime) {
    this.pulseScale += this.pulseSpeed * deltaTime;

    if (this.pulseScale > this.pulseResetAt) {
        this.pulseScale = 0;
    }

    const scale = this.pulseScale;

    this.pulseMesh.scale.set(scale, scale, scale);

    // fade out as it expands
    const t = 1 - (scale / this.pulseResetAt);
    this.pulseMesh.material.opacity = t * 0.6;
    }
}