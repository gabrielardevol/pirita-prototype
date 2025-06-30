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
  private world!: THREE.Group;
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
    this.camera.position.set(0, 0, 0); // Centrada a l’origen
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Il·luminació
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Grup del món
    this.world = new THREE.Group();
    this.scene.add(this.world);

    // Terra
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.world.add(ground);

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
      this.world.add(marker);
      this.objects[point.label] = marker;
    }

    // ✅ Rotació inicial del món per corregir orientació (compensa que el mòbil està pla)
    this.world.rotation.x = Math.PI / 2;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  private setupDeviceOrientation(): void {
    // Demana permís a iOS
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
          } else {
            console.warn('Permís rebutjat');
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
    }
  }

  private onDeviceOrientation = (event: DeviceOrientationEvent): void => {
    if (event.alpha == null || event.beta == null || event.gamma == null) return;

    // Passem graus a radians
    const alpha = THREE.MathUtils.degToRad(event.alpha); // Azimut
    const beta = THREE.MathUtils.degToRad(event.beta);   // Inclinació cap amunt/avall
    const gamma = THREE.MathUtils.degToRad(event.gamma); // Inclinació lateral

    // Construïm rotació
    const euler = new THREE.Euler();
    euler.set(beta, alpha, -gamma, 'YXZ');

    const quaternion = new THREE.Quaternion().setFromEuler(euler);

    // ✅ Apliquem rotació a la càmera
    this.camera.quaternion.copy(quaternion);
  };
}
