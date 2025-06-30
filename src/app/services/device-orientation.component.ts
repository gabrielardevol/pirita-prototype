import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-device-orientation',
  template: `
    <h2>Orientació del dispositiu</h2>
    <p>Alpha (rotació Z): {{ alpha }}</p>
    <p>Beta (inclinació X): {{ beta }}</p>
    <p>Gamma (inclinació Y): {{ gamma }}</p>
  `
})
export class DeviceOrientationComponent implements OnInit, OnDestroy {
  alpha: number | null = null;
  beta: number | null = null;
  gamma: number | null = null;

  handler = (event: DeviceOrientationEvent) => {
    this.alpha = event.alpha;
    this.beta = event.beta;
    this.gamma = event.gamma;
  };

  ngOnInit() {
    window.addEventListener('deviceorientation', this.handler);
  }

  ngOnDestroy() {
    window.removeEventListener('deviceorientation', this.handler);
  }
}
