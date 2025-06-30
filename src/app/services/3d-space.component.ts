import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-3d-space',
  template: `
    <p>rotació x: {{ camera.rotation.x.toFixed(2) }}</p>
    <p>rotació y: {{ camera.rotation.y.toFixed(2) }}</p>
    <p>rotació z: {{ camera.rotation.z.toFixed(2) }}</p>

    <form style="margin-top: 10px;">
      <label>
        X (rad):
        <input type="number" step="0.01" [(ngModel)]="rotationX" (focus)="manualControl=true" (ngModelChange)="applyRotation()" name="rotX" [disabled]="!manualControl">
      </label>
      <label>
        Y (rad):
        <input type="number" step="0.01" [(ngModel)]="rotationY" (focus)="manualControl=true" (ngModelChange)="applyRotation()" name="rotY" [disabled]="!manualControl">
      </label>
      <label>
        Z (rad):
        <input type="number" step="0.01" [(ngModel)]="rotationZ" (focus)="manualControl=true" (ngModelChange)="applyRotation()" name="rotZ" [disabled]="!manualControl">
      </label>
    </form>

    <button (click)="calibrate()">Calibrar (posar com a zero)</button>
    <button (click)="useSensor()">Usar sensor</button>

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
    }

    form label {
      margin-right: 10px;
    }
  `]
})
export class ThreeDSpaceComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  private scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private ground!: THREE.Mesh;
  private animationId: number | null = null;
  private worldGroup!: THREE.Group;

  rotationX = 0;
  rotationY = 0;
  rotationZ = 0;

  manualControl = false; // Control manual activat?
  offsetQuaternion = new THREE.Quaternion();

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
    if (!this.manualControl && event.alpha !== null && event.beta !== null && event.gamma !== null) {
      const quaternion = this.getQuaternionFromDeviceOrientation(event.alpha, event.beta, event.gamma);
      quaternion.multiply(this.offsetQuaternion);
      this.camera.quaternion.copy(quaternion);
      // Actualitza valors numèrics per mostrar a UI (sense disparar events)
      const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion);
      this.rotationX = euler.x;
      this.rotationY = euler.y;
      this.rotationZ = euler.z;
    }
  };

  getQuaternionFromDeviceOrientation(alphaDeg: number = 0, betaDeg: number = 0, gammaDeg: number = 0): THREE.Quaternion {
    const degToRad = (deg: number) => deg * Math.PI / 180;
    const alpha = degToRad(alphaDeg);
    const beta = degToRad(betaDeg);
    const gamma = degToRad(gammaDeg);
    const euler = new THREE.Euler(beta, gamma, alpha, 'ZXY');
    return new THREE.Quaternion().setFromEuler(euler);
  }

  calibrate() {
    // Guarda la inversa del quaternion actual per compensar la rotació
    this.offsetQuaternion.copy(this.camera.quaternion).invert();
  }

  useSensor() {
    this.manualControl = false;
  }

  applyRotation() {
    if (this.manualControl) {
      this.camera.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
    }
  }

  private initThree(): void {
    this.scene = new THREE.Scene();

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.5, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);

    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x228822, side: THREE.DoubleSide });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = 0;
    this.worldGroup.add(this.ground);

    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(cubeGeo, cubeMat);
    this.cube.position.y = 0.5;
    this.worldGroup.add(this.cube);

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
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }
}
