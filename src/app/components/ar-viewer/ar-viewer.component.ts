import {
  Component,
  OnInit,
  AfterViewInit,
  Renderer2,
  ElementRef,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-ar-viewer',
  templateUrl: './ar-viewer.component.html',
  styleUrls: ['./ar-viewer.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ArViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('scene') sceneRef!: ElementRef;

  gpsReady = false;
  loading = true;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.getLocation();
    const cam = document.querySelector('[gps-camera]');
    cam?.addEventListener('gps-camera-update-position', (e: any) => {
      console.log('GPS OK:', e.detail.position);
    });

  }

  ngAfterViewInit(): void {
    // No inicialitzem res fins que gpsReady sigui true
  }

  ngAfterViewChecked(): void {
    // Quan gpsReady canvia a true, afegim els listeners
    if (this.gpsReady && this.sceneRef) {
      const sceneEl = this.sceneRef.nativeElement as HTMLElement;

      // Evitar múltiples listeners en diferents cicles
      if (!sceneEl.hasAttribute('data-listeners-added')) {
        sceneEl.setAttribute('data-listeners-added', 'true');

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

        camera?.addEventListener('gps-camera-update-position' as any, (e: any) => {
          document.getElementById("location").textContent = "located"
          const lat = e.detail.position.latitude;
          const lon = e.detail.position.longitude;
          text?.setAttribute('value', `LAT: ${lat.toFixed(5)}\nLON: ${lon.toFixed(5)}`);
        });
      }
    }
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

  getLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Posició obtinguda:', position.coords.latitude, position.coords.longitude);
          this.gpsReady = true;
          this.loading = false;
        },
        (error) => {
          console.error('Error obtenint posició:', error);
          alert('No s’ha pogut obtenir permís o ubicació GPS.');
          this.loading = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert('Geolocalització no suportada pel navegador.');
      this.loading = false;
    }
  }
}
