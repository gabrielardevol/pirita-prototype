import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-3d-space',
  template: `
    <p>rotació x: {{ this.camera.rotation.x }}</p>
    <p>rotació y: {{ this.camera.rotation.y }}</p>
    <p>rotació z: {{ this.camera.rotation.z }}</p>
    <button (click)="rotateWorldGroup()">Gira el món (Y +0.1 rad)</button>

    <form style="margin-top: 10px;">
      <label>
        X (rad):
        <input type="number" step="0.01" [(ngModel)]="rotationX" (ngModelChange)="applyRotation()" name="rotX">
      </label>
      <label>
        Y (rad):
        <input type="number" step="0.01" [(ngModel)]="rotationY" (ngModelChange)="applyRotation()" name="rotY">
      </label>
      <label>
        Z (rad):
        <input type="number" step="0.01" [(ngModel)]="rotationZ" (ngModelChange)="applyRotation()" name="rotZ">
      </label>
    </form>
    <div #container></div>
  `,
  imports: [
    FormsModule
  ],
  styles: [`
    :host {
      display: block;
      width: 600px;
      height: 600px;
      overflow: hidden;
    }

    div {
      width: 600px;
      height: 600px;
      transform: rotate(180deg);
    }
  `]
})
export class ThreeDSpaceComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  private scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private ground!: THREE.Mesh;
  private animationId: number | null = null;

  // Array de cubs
  private cubes: THREE.Mesh[] = [];

  // Grup per pivotar la càmera i el món
  private worldGroup!: THREE.Group;

  rotationX = 0;
  rotationY = 0;
  rotationZ = 0;

  ngOnInit(): void {
    this.initThree();
    this.animate();
    window.addEventListener('deviceorientation', this.handler);
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    window.removeEventListener('deviceorientation', this.handler);
  }

  handler = (event: DeviceOrientationEvent) => {
    if (event.alpha === null) return;
    if (event.beta === null) return;
    if (event.gamma === null) return;

    const quaternion = this.getQuaternionFromDeviceOrientation(event.alpha, event.beta, event.gamma);
    this.camera.quaternion.copy(quaternion).invert();

    const eulerFromQuat = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
    this.rotationX = eulerFromQuat.x;
    this.rotationY = eulerFromQuat.y;
    this.rotationZ = eulerFromQuat.z;

  };

  getQuaternionFromDeviceOrientation(alphaDeg: number = 0, betaDeg: number = 0, gammaDeg: number = 0): THREE.Quaternion {
    const degToRad = (deg: number) => deg * Math.PI / 180;

    const alpha = degToRad(alphaDeg); // Z
    const beta = degToRad(betaDeg);   // X
    const gamma = degToRad(gammaDeg); // Y

    const euler = new THREE.Euler(beta, gamma, alpha, 'YXZ');
    // const euler = new THREE.Euler(beta, gamma, alpha, 'ZXY');

    return new THREE.Quaternion().setFromEuler(euler);
  }

  applyRotation() {
    this.setCameraRotationManual(this.rotationX, this.rotationY, this.rotationZ);
  }


  setCameraRotationManual(xRad: number, yRad: number, zRad: number) {
    const euler = new THREE.Euler(xRad, yRad, zRad, 'YXZ');
    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    this.camera.quaternion.copy(quaternion);
  }


  private initThree(): void {
    this.scene = new THREE.Scene();

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.5, 0); // Alçada típica del cap respecte al terra

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // Grup per món (terra + objectes)
    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);

    // Terra
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x228822, side: THREE.DoubleSide });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2; // terra horitzontal
    this.ground.position.y = 0;
    this.worldGroup.add(this.ground);

    // Crear 4 cubs a 5 metres en les 4 direccions oposades
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = new THREE.MeshNormalMaterial();

    const positions = [
      new THREE.Vector3(0, 0.5, -5),  // Front
      new THREE.Vector3(0, 0.5, 5),   // Darrere
      new THREE.Vector3(-5, 0.5, 0),  // Esquerra
      new THREE.Vector3(5, 0.5, 0),   // Dreta
    ];

    this.cubes = positions.map(pos => {
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.position.copy(pos);
      this.worldGroup.add(cube);
      return cube;
    });

    // Llums
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);

    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    //
    // // Fer girar tots els cubs
    // for (const cube of this.cubes) {
    //   cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;
    // }

    this.renderer.render(this.scene, this.camera);
  }

  rotateWorldGroup() {
    this.worldGroup.rotation.x += Math.PI / 2;
    // this.worldGroup.rotation.y += 1.5;

  }

}
