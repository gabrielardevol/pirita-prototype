import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
@Component({
  selector: 'app-3d-space',
  template: `<div #container></div>`,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    div {
      width: 100%;
      height: 100%;
    }
  `]
})
export class ThreeDSpaceComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private animationId: number | null = null;

  ngOnInit(): void {
    this.initThree();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
  }

  handler = (event: DeviceOrientationEvent) => {
    this.setCameraRotation(
      event.alpha || 0, event.beta  || 0, event.gamma || 0
    )
  };

  private initThree(): void {
    // Escena
    this.scene = new THREE.Scene();

    // Càmera
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // Cub
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Posa la rotació inicial de la càmera (angles en radians)
    this.setCameraRotation(Math.PI / 12, Math.PI / 6, 0);

    // Ajustar la mida en redimensionar la finestra
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

    // Rotació contínua cub
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
