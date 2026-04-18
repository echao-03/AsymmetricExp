/**
 * @license
 * GrabVR library and demos
 * Copyright 2018-2023 Sean Bradley https://sbcode.net
 * https://github.com/Sean-Bradley/GrabVR/blob/master/LICENSE
 */

import * as THREE from "three";

export default class GrabVR {
  private _controller: { [id: number]: THREE.Object3D } = {};
  private _raycaster: { [id: number]: THREE.Raycaster } = {};
  private _quaternion: { [id: number]: THREE.Quaternion } = {};
  private _grabbedObject: { [id: number]: THREE.Object3D } = {};
  private _hasAGrabbedObject: { [id: number]: Boolean } = {};
  private _line: { [id: number]: THREE.Object3D } = {};
  private _grabberHook: { [id: number]: THREE.Mesh } = {};
  private _gamepad: { [id: number]: Gamepad } = {};
  private _grabableObjects: THREE.Object3D[] = [];
  private _direction = new THREE.Vector3(0, -1, 0);
  private _eventListeners: any[] = new Array();

  private _maxGrabDistance = 0.3; // meters, tune as needed

  constructor() { }

  public grabableObjects() {
    return this._grabableObjects;
  }

  public add(id: number, o: THREE.Object3D, gamepad: Gamepad) {
    this._controller[id] = o;
    this._raycaster[id] = new THREE.Raycaster();
    this._quaternion[id] = new THREE.Quaternion();
    this._gamepad[id] = gamepad;

    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, -100, 0));
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    this._line[id] = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0x8888ff })
    );
    this._line[id].visible = false;
    o.add(this._line[id]);

    this._grabberHook[id] = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: false,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
      })
    );

    o.add(this._grabberHook[id]);
    this._grabberHook[id].visible = false;
  }

  public update(dt: number) {
    for (const key in Object.keys(this._controller)) {
      this._controller[key].getWorldPosition(this._raycaster[key].ray.origin);
      this._controller[key].getWorldQuaternion(this._quaternion[key]);
      this._raycaster[key].ray.direction
        .copy(this._direction)
        .applyEuler(
          new THREE.Euler().setFromQuaternion(this._quaternion[key], "XYZ")
        );

      const controller = this._controller[key];
      const raycaster = this._raycaster[key];
      const gamepad = this._gamepad[key];

      if (!controller || !raycaster || !gamepad) continue;

      raycaster.far = this._maxGrabDistance;

      const intersects = raycaster.intersectObjects(this._grabableObjects, true);

      // Extra safety gate using hit distance
      const hit = intersects[0];
      const closeEnough = !!hit && hit.distance <= this._maxGrabDistance;

      if (closeEnough) {
        this._line[key].visible = false;

        if (gamepad.buttons[1].pressed) {
          if (!this._hasAGrabbedObject[key]) {
            this._grabberHook[key].position.copy(
              controller.worldToLocal(hit.object.position)
            );
            this._grabbedObject[key] = hit.object;
            this._grabbedObject[key].userData.isGrabbed = true;
            this._grabberHook[key].visible = true;
            this._hasAGrabbedObject[key] = true;
            this.dispatchEvent("grabStart", Number(key));
          }

          this.dispatchEvent("grabMove", Number(key));
        }
      } else {
        this._line[key].visible = false;
      }

      if (!gamepad.buttons[1].pressed && this._hasAGrabbedObject[key]) {
        this._hasAGrabbedObject[key] = false;
        this._grabberHook[key].visible = false;
        this._grabbedObject[key].userData.isGrabbed = false;
        this.dispatchEvent("grabEnd", Number(key));
      }

      if (this._hasAGrabbedObject[key]) {
        this._grabberHook[key].getWorldPosition(this._grabbedObject[key].position);
      }
    }
  }

  public addEventListener(type: string, eventHandler: any) {
    const listener = { type: type, eventHandler: eventHandler };
    this._eventListeners.push(listener);
  }

  public dispatchEvent(type: string, id: number) {
    for (let i = 0; i < this._eventListeners.length; i++) {
      if (type === this._eventListeners[i].type) {
        this._eventListeners[i].eventHandler(id);
      }
    }
  }
}
