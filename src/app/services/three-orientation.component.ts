import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-orientation',
  template: '<div #rendererContainer class="canvas-container"></div>',
  styles: [`
    .canvas-container {
      width: 300px;
      height: 300px;
      overflow: hidden;
    }
  `]
})
export class ThreeOrientationComponent implements OnInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  cube!: THREE.Mesh;
  sphere!: THREE.Mesh;
  private objects: { [key: string]: THREE.Mesh } = {};

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.initThree();
    this.initObjects();
    this.animate();
    this.handleOrientation();
  }

  initThree() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10).normalize();
    this.scene.add(light);
  }

  initObjects() {
    // Terra / horitzó
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);


    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(2, 0, -5);
    this.scene.add(this.cube);

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

  handleOrientation() {
    window.addEventListener('deviceorientation', (event) => {
      if (event.alpha === null || event.beta === null || event.gamma === null) return;

      const alpha = THREE.MathUtils.degToRad(event.alpha || 0); // Z
      const beta = THREE.MathUtils.degToRad(event.beta || 0);   // X'
      const gamma = THREE.MathUtils.degToRad(event.gamma || 0); // Y''

      const euler = new THREE.Euler();
      euler.set(beta, alpha, -gamma, 'YXZ');

      this.camera.quaternion.setFromEuler(euler);
    }, true);
  }

  animate = () => {
    this.ngZone.runOutsideAngular(() => {
      const renderLoop = () => {
        requestAnimationFrame(renderLoop);
        this.renderer.render(this.scene, this.camera);
      };
      renderLoop();
    });
  };
}
