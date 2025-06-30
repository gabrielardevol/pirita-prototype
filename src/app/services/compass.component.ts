import {
  Component, ElementRef, AfterViewInit, ViewChild, NgZone, OnDestroy
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-compass-3d',
  template: `<div #rendererContainer class="scene-container"></div>`,
  styles: [`.scene-container { width: 100%; height: 100vh; overflow: hidden; }`]
})
export class Compass3DComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: false }) rendererContainer!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private objects: { [key: string]: THREE.Mesh } = {};
  private orientationListener!: (event: DeviceOrientationEvent) => void;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
    this.setupDeviceOrientation();
  }

  ngOnDestroy(): void {
    if (this.orientationListener) {
      window.removeEventListener('deviceorientation', this.orientationListener);
    }
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0d8ef);

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Il·luminació
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);

    // Terra / horitzó
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // Objectes als punts cardinals
    const markerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cardinalPoints = [
      { label: 'N', x: 0, z: -5, color: 0xff0000 },
      { label: 'S', x: 0, z: 5, color: 0x00ff00 },
      { label: 'E', x: 5, z: 0, color: 0x0000ff },
      { label: 'O', x: -5, z: 0, color: 0xffff00 },
    ];

    for (const point of cardinalPoints) {
      const material = new THREE.MeshStandardMaterial({ color: point.color });
      const marker = new THREE.Mesh(markerGeometry, material);
      marker.position.set(point.x, 0.25, point.z);
      this.scene.add(marker);
      this.objects[point.label] = marker;
    }
  }

  private animate = () => {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    });
  };

  private setupDeviceOrientation(): void {
    this.orientationListener = (event: DeviceOrientationEvent) => {
      this.ngZone.run(() => {
        if (event.alpha !== null) {
          // Convertir a radians
          const alpha = THREE.MathUtils.degToRad(event.alpha || 0);
          const beta = THREE.MathUtils.degToRad(event.beta || 0);
          const gamma = THREE.MathUtils.degToRad(event.gamma || 0);

          // Crear un quaternió per a la rotació
          const quaternion = new THREE.Quaternion();

          // Aplicar les rotacions en l'ordre correcte
          // 1. Rotació al voltant de l'eix Z (alpha)
          const zQuaternion = new THREE.Quaternion();
          zQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), alpha);
          quaternion.multiply(zQuaternion);

          // 2. Rotació al voltant de l'eix X (beta)
          const xQuaternion = new THREE.Quaternion();
          xQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), beta);
          quaternion.multiply(xQuaternion);

          // 3. Rotació al voltant de l'eix Y (gamma)
          const yQuaternion = new THREE.Quaternion();
          yQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -gamma);
          quaternion.multiply(yQuaternion);

          // Ajust addicional per alinear els eixos (90 graus al voltant de X)
          const adjustQuaternion = new THREE.Quaternion();
          adjustQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
          quaternion.multiply(adjustQuaternion);

          // Aplicar a la càmera
          this.camera.setRotationFromQuaternion(quaternion);
        }
      });
    };

    // Demanar permís per a l'orientació en dispositius iOS 13+
    if (window.DeviceOrientationEvent &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', this.orientationListener, true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', this.orientationListener, true);
    }
  }
}
