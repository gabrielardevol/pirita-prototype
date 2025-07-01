import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CameraComponent} from './services/camera.component';
import {GeolocationComponent} from './services/geolocation.component';
import {DeviceOrientationComponent} from './services/device-orientation.component';
import {ThreeDSpaceComponent} from './services/3d-space.component';
import {Compass3DComponent} from './services/compass.component';
import {ThreeOrientationComponent} from './services/three-orientation.component';
import {ArViewerComponent} from './components/ar-viewer/ar-viewer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CameraComponent, GeolocationComponent, DeviceOrientationComponent, ThreeDSpaceComponent, Compass3DComponent, ThreeOrientationComponent, ArViewerComponent],
  template: `
<!--  <app-camera></app-camera>-->
<!--  <app-geolocation></app-geolocation>-->
<!--  <app-device-orientation></app-device-orientation>-->
<!--<app-compass-3d></app-compass-3d>-->
<!--  <app-three-orientation></app-three-orientation>-->
<!--  <app-3d-space></app-3d-space>-->
<app-ar-viewer></app-ar-viewer>

  `,
})
export class AppComponent {
  title = 'pirita-prototype';
}
