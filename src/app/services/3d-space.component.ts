import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-3d-space',
  template: `
    <p>rotació x: {{this.camera.rotation.x }}</p>
    <div #container></div>
  `,
  styles: [`
    :host {
      display: block;
      width: 300px;
      height: 300px;
      overflow: hidden;
    }
    div {
      width: 300px;
      height: 300px;
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

  // Grup per pivotar la càmera i el món
  private worldGroup!: THREE.Group;

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

    // Converteix graus a radians
    const degToRad = (deg: number) => deg * Math.PI / 180;

    const alpha = degToRad(event.alpha || 0); // Z
    const beta = degToRad(event.beta || 0);   // X
    const gamma = degToRad(event.gamma || 0); // Y

    // Crear quaternion a partir dels angles ZXY (ordre usat per sensors)
    const euler = new THREE.Euler(beta, gamma, alpha, 'ZXY');
    const quaternion = new THREE.Quaternion().setFromEuler(euler);

    // Posa la rotació de la càmera com la inversa del quaternion (rotació del dispositiu)
    // Això fa que la càmera "miri" cap a la direcció real.
    this.camera.quaternion.copy(quaternion).invert();
  };

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

    // Cub d'exemple sobre el terra
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(cubeGeo, cubeMat);
    this.cube.position.y = 0.5; // mig metre sobre el terra
    this.cube.position.x = 2;
    this.worldGroup.add(this.cube);

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
    // this.animationId = requestAnimationFrame(this.animate);
    //
    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;
    //
    // this.renderer.render(this.scene, this.camera);
  }
}
