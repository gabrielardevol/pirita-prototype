import {
  Component, ElementRef, AfterViewInit, ViewChild, NgZone
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-compass-3d',
  template: `<div #rendererContainer class="scene-container"></div>`,
  styles: [`.scene-container { width: 100%; height: 100vh; overflow: hidden; }`]
})
export class Compass3DComponent implements AfterViewInit {
  @ViewChild('rendererContainer', { static: false }) rendererContainer!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private objects: { [key: string]: THREE.Mesh } = {};

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
    this.setupDeviceOrientation();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0d8ef);

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 5);
    let fixup = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI*.5,0,0));
    this.camera.setRotationFromQuaternion(fixup);
    this.camera.quaternion.multiply(fixup)

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Il·luminació
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Terra / horitzó
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // Objectes als punts cardinals
    const markerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cardinalPoints = [
      { label: 'N', x: 0, z: -5 },
      { label: 'S', x: 0, z: 5 },
      { label: 'E', x: 5, z: 0 },
      { label: 'O', x: -5, z: 0 },
    ];

    for (const point of cardinalPoints) {
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, material);
      marker.position.set(point.x, 0.25, point.z);
      this.scene.add(marker);
      this.objects[point.label] = marker;
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  private setupDeviceOrientation(): void {
    window.addEventListener('deviceorientation', (event) => {
      if (event.alpha !== null) {
        const alpha = THREE.MathUtils.degToRad(event.alpha || 0);
        const beta = THREE.MathUtils.degToRad(event.beta || 0);
        const gamma = THREE.MathUtils.degToRad(event.gamma || 0);

        const euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');
        this.camera.quaternion.setFromEuler(euler);
      }
    }, true);
  }




}
