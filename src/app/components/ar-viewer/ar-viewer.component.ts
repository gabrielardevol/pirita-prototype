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
    sceneEl.addEventListener('touchstart', (event: TouchEvent) => {
      if (event.touches.length > 0) {
        this.placeObject(event);
      }
    });
    sceneEl.addEventListener('click', (event: MouseEvent) => {
      this.placeObject(event);
    });

    const camera = document.querySelector('[gps-camera]');
    const text = document.getElementById('gps-text');

    camera?.addEventListener('gps-camera-update-position', (e: any) => {
      const lat = e.detail.position.latitude;
      const lon = e.detail.position.longitude;
      text?.setAttribute('value', `LAT: ${lat.toFixed(5)}\nLON: ${lon.toFixed(5)}`);
    });
  }

  placeObject(event: MouseEvent | TouchEvent): void {
    let clientX: number, clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      // És un TouchEvent
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event && 'clientY' in event) {
      // És un MouseEvent
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    } else {
      // No s'ha pogut extreure coordenades
      return;
    }

    // Ara continua igual que abans, amb clientX i clientY
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
