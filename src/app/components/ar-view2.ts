import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-ar-gps-scene',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
<!--    <a-scene-->
<!--      (click)="placeObject($event)"-->

<!--      vr-mode-ui="enabled: false"-->
<!--      embedded-->
<!--      arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best;"-->
<!--      renderer="logarithmicDepthBuffer: true;"-->
<!--    >-->
<!--      &lt;!&ndash; Objecte 3D a coordenades GPS &ndash;&gt;-->
<!--&lt;!&ndash;      <a-entity&ndash;&gt;-->
<!--&lt;!&ndash;        gps-new-entity-place="latitude: 41.0790405; longitude: 1.1496969"&ndash;&gt;-->
<!--&lt;!&ndash;        gltf-model="https://cdn.aframe.io/test-models/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf"&ndash;&gt;-->
<!--&lt;!&ndash;        scale="1 1 1"&ndash;&gt;-->
<!--&lt;!&ndash;        rotation="0 180 0"&ndash;&gt;-->
<!--&lt;!&ndash;      ></a-entity>&ndash;&gt;-->

<!--      <a-box material="color: yellow" gps-new-entity-place="latitude: 41.0790405; longitude: 1.1496969"></a-box>-->

<!--      &lt;!&ndash; Càmera GPS &ndash;&gt;-->
<!--      <a-camera gps-camera rotation-reader id="camera"></a-camera>-->
<!--    </a-scene>-->
<a-scene
  vr-mode-ui="enabled: false"
  arjs="sourceType: webcam; debugUIEnabled: false;"
  renderer="logarithmicDepthBuffer: true;"
  gps-camera-debug="minDistance: 5; maxDistance: 100;"
  cursor="rayOrigin: mouse"
  raycaster="objects: .clickable">

  <!-- Càmera GPS -->
  <a-camera gps-camera rotation-reader></a-camera>

  <!-- Marcador per a la posició actual -->
  <a-entity gps-entity-place="latitude: 0; longitude: 0" class="clickable">
    <a-sphere
      material="color: red"
      scale="5 5 5"
      position="0 0 0"
      visible="false"
      class="user-position">
    </a-sphere>
  </a-entity>

  <!-- Sistema per afegir nous objectes -->
  <a-entity id="object-creator"></a-entity>
</a-scene>

<div id="info">
  Clica a la pantalla per col·locar un objecte en aquesta posició
</div>
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
  userLatitude: number = 0;
  userLongitude: number = 0;
  objectsPlaced: number = 0;
  readonly maxObjects: number = 20;

  ngOnInit(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        this.updatePosition.bind(this),
        this.handleLocationError,
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000,
        }
      );
    } else {
      alert('Geolocalització no suportada en aquest navegador.');
    }

    document.addEventListener('click', this.handleClick.bind(this));
  }

  private updatePosition(position: GeolocationPosition): void {
    this.userLatitude = position.coords.latitude;
    this.userLongitude = position.coords.longitude;

    const userPosition = document.querySelector('.user-position') as HTMLElement | null;
    if (userPosition) {
      userPosition.setAttribute('visible', 'true');

      const parent = userPosition.parentElement;
      if (parent) {
        parent.setAttribute('gps-entity-place', JSON.stringify({
          latitude: this.userLatitude,
          longitude: this.userLongitude,
        }));
      }
    }
  }

  private handleLocationError(error: GeolocationPositionError): void {
    console.error('Error de geolocalització:', error);
    alert('Error obtenint la ubicació. Assegura\'t que tens activat el GPS.');
  }

  private handleClick(): void {
    if (this.objectsPlaced >= this.maxObjects) {
      alert('Has assolit el límit màxim d\'objectes');
      return;
    }

    const newObject = document.createElement('a-entity');
    const objectId = 'object-' + Date.now();

    newObject.setAttribute('gps-entity-place', JSON.stringify({
      latitude: this.userLatitude,
      longitude: this.userLongitude,
    }));

    newObject.setAttribute('geometry', 'primitive: box');
    newObject.setAttribute('material', `color: ${this.getRandomColor()}`);
    newObject.setAttribute('scale', '5 5 5');
    newObject.setAttribute('class', 'clickable');
    newObject.setAttribute('id', objectId);
    newObject.setAttribute('animation', JSON.stringify({
      property: 'rotation',
      to: '0 360 0',
      dur: 10000,
      loop: true,
      easing: 'linear',
    }));

    const scene = document.querySelector('#object-creator');
    if (scene) {
      scene.appendChild(newObject);
      this.objectsPlaced++;
      console.log(`Objecte afegit a lat: ${this.userLatitude}, long: ${this.userLongitude}`);
    }
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
