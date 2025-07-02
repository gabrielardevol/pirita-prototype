import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-ar-gps-scene',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <a-scene
      (click)="placeObject($event)"

      vr-mode-ui="enabled: false"
      embedded
      arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best;"
      renderer="logarithmicDepthBuffer: true;"
    >
      <!-- Objecte 3D a coordenades GPS -->
      <a-entity
        gps-entity-place="latitude: 41.0790405; longitude: 1.1496969"
        gltf-model="https://cdn.aframe.io/test-models/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf"
        scale="1 1 1"
        rotation="0 180 0"
      ></a-entity>

      <!-- Càmera GPS -->
      <a-camera gps-camera rotation-reader></a-camera>
    </a-scene>
  `,
  styles: [`
    a-scene {
      width: 100vw;
      height: 100vh;
      display: block;
      margin: 0;
      padding: 0;
    }
  `]
})
export class ArGpsSceneComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Aquí pots afegir lògica si vols
  }

  placeObject(event: MouseEvent | TouchEvent): void {
    let clientX: number, clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event && 'clientY' in event) {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    } else {
      return;
    }

    const cameraEl = document.querySelector('[camera]');
    const sceneEl = document.querySelector('a-scene');
    if (!cameraEl || !sceneEl) return;

    const camera = (cameraEl as any).getObject3D('camera');
    if (!camera) return;

    const mouse = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const point = new THREE.Vector3();
    point.copy(raycaster.ray.origin).add(raycaster.ray.direction.multiplyScalar(0.5));

    const box = document.createElement('a-box');
    box.setAttribute('width', '0.1');
    box.setAttribute('height', '0.1');
    box.setAttribute('depth', '0.1');
    box.setAttribute('color', 'orange');
    box.setAttribute('position', `${point.x} ${point.y} ${point.z}`);

    sceneEl.appendChild(box);
  }

}
