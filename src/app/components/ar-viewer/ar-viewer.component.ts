import {
  Component,
  OnInit,
  AfterViewInit,
  Renderer2,
  ElementRef,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-ar-viewer',
  templateUrl: './ar-viewer.component.html',
  styleUrls: ['./ar-viewer.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // ✅ Afegeix aquesta línia

})
export class ArViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('scene') sceneRef!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const sceneEl = this.sceneRef.nativeElement as HTMLElement;

    sceneEl.addEventListener('click', (event: MouseEvent) => {
      this.placeObject(event);
    });
  }

  placeObject(event: MouseEvent): void {
    const cameraEl = document.querySelector('[camera]');
    const sceneEl = document.querySelector('a-scene');

    if (!cameraEl || !sceneEl) return;

    const camera = (cameraEl as any).getObject3D('camera');
    if (!camera) return;

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Punt a 1.5 metres en la direcció del clic
    const point = new THREE.Vector3();
    point.copy(raycaster.ray.origin).add(raycaster.ray.direction.multiplyScalar(1.5));

    const box = document.createElement('a-box');
    box.setAttribute('width', '0.1');
    box.setAttribute('height', '0.1');
    box.setAttribute('depth', '0.1');
    box.setAttribute('color', 'orange');
    box.setAttribute('position', `${point.x} ${point.y} ${point.z}`);

    sceneEl.appendChild(box);
  }
}
