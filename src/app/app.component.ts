import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CameraComponent} from './services/camera.component';
import {GeolocationComponent} from './services/geolocation.component';
import {DeviceOrientationComponent} from './services/device-orientation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CameraComponent, GeolocationComponent, DeviceOrientationComponent],
  template: `
  <app-camera></app-camera>
  <app-geolocation></app-geolocation>
  <app-device-orientation></app-device-orientation>
  `,
})
export class AppComponent {
  title = 'pirita-prototype';
}
