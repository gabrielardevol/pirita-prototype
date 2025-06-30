import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CameraComponent} from './services/camera.component';
import {GeolocationComponent} from './services/geolocation.component';
import {DeviceOrientationComponent} from './services/device-orientation.component';
import {ThreeDSpaceComponent} from './services/3d-space.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CameraComponent, GeolocationComponent, DeviceOrientationComponent, ThreeDSpaceComponent],
  template: `
  <app-camera></app-camera>
  <app-geolocation></app-geolocation>
  <app-device-orientation></app-device-orientation>
  <app-3d-space></app-3d-space>
  `,
})
export class AppComponent {
  title = 'pirita-prototype';
}
