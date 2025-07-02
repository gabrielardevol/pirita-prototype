import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CameraComponent} from './services/camera.component';
import {GeolocationComponent} from './services/geolocation.component';
import {DeviceOrientationComponent} from './services/device-orientation.component';
import {ThreeDSpaceComponent} from './services/3d-space.component';
import {Compass3DComponent} from './services/compass.component';
import {ThreeOrientationComponent} from './services/three-orientation.component';
import {ArViewerComponent} from './components/ar-viewer/ar-viewer.component';
import {RealtimeLocationComponent} from './components/realtime-location.coponent';
import {ArGpsSceneComponent} from './components/ar-view2';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CameraComponent, GeolocationComponent, DeviceOrientationComponent, ThreeDSpaceComponent, Compass3DComponent, ThreeOrientationComponent, ArViewerComponent, RealtimeLocationComponent, ArGpsSceneComponent],
  template: `
<!--    <app-realtime-location></app-realtime-location>-->
    <div style="position: relative">
      <app-camera ></app-camera>
      <app-ar-gps-scene style="position: absolute; top: 0"></app-ar-gps-scene>

      <!--  <app-geolocation></app-geolocation>-->
      <!--  <app-device-orientation></app-device-orientation>-->
      <!--<app-compass-3d></app-compass-3d>-->
      <!--  <app-three-orientation></app-three-orientation>-->
      <!--  <app-3d-space></app-3d-space>-->
<!--      <app-ar-viewer style="position: absolute; top: 0"></app-ar-viewer>-->
    </div>


  `,
})
export class AppComponent {
  title = 'pirita-prototype';
}
