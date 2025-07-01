import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-orientation',
  template: '<div #rendererContainer class="canvas-container"></div>',
  styles: [`
    .canvas-container {
      width: 100vw;
      height: 100vh;
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
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(2, 0, -5);
    this.scene.add(this.cube);

    const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    this.sphere = new THREE.Mesh(sphereGeo, sphereMat);
    this.sphere.position.set(-2, 0, -5);
    this.scene.add(this.sphere);
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
