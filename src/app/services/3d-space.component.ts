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
  private animationId: number | null = null;

  ngOnInit(): void {
    this.initThree();
    this.animate();
    window.addEventListener('deviceorientation', this.handler);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    window.removeEventListener('deviceorientation', this.handler);
  }

  handler = (event: DeviceOrientationEvent) => {
    const degToRad = (deg: number) => deg * Math.PI / 180;

    const alpha = degToRad(event.alpha || 0);
    const beta  = degToRad(event.beta  || 0);
    const gamma = degToRad(event.gamma || 0);

    this.setCameraRotation(beta, gamma, alpha);
  };

  private initThree(): void {
    this.scene = new THREE.Scene();

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 5); // puja una mica la càmera per veure el terra

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // Cub
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Terra (plane)
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x228822, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2; // gira el pla 90 graus per fer-lo horitzontal
    ground.position.y = -0.5; // posa-ho just sota el cub (el cub fa 1 d'alçada)
    this.scene.add(ground);

    // Afegim llum perquè es vegi el terra (amb materials que reaccionen a la llum)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);

    this.setCameraRotation(Math.PI / 12, Math.PI / 6, 0);

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

  setCameraRotation(x: number, y: number, z: number) {
    this.camera.rotation.x = x;
    this.camera.rotation.y = y;
    this.camera.rotation.z = z;
  }
}
