import { Component, OnDestroy, OnInit } from '@angular/core';
import {DecimalPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-realtime-location',
  template: `
    <div class="location-container">
      <h2>📍 Posició en temps real</h2>

      <div *ngIf="errorMessage" class="error">
        ⚠️ {{ errorMessage }}
      </div>

      <div *ngIf="!errorMessage && latitude !== null && longitude !== null">
        <p><strong>Latitud:</strong> {{ latitude | number: '1.6-6' }}</p>
        <p><strong>Longitud:</strong> {{ longitude | number: '1.6-6' }}</p>
        <p><strong>Precisió:</strong> ±{{ accuracy }} metres</p>
      </div>

      <div *ngIf="!latitude && !errorMessage">
        ⏳ Obtenint posició...
      </div>
    </div>
  `,
  imports: [
    DecimalPipe,
    NgIf
  ],
})
export class RealtimeLocationComponent implements OnInit, OnDestroy {
  latitude: number | null = null;
  longitude: number | null = null;
  accuracy: number | null = null;
  watchId: number | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {
    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.accuracy = position.coords.accuracy;
          this.errorMessage = null;
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.errorMessage = 'Permís denegat.';
              break;
            case error.POSITION_UNAVAILABLE:
              this.errorMessage = 'Posició no disponible.';
              break;
            case error.TIMEOUT:
              this.errorMessage = 'Temps d’espera esgotat.';
              break;
            default:
              this.errorMessage = 'Error desconegut.';
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000
        }
      );
    } else {
      this.errorMessage = 'Geolocalització no suportada pel navegador.';
    }
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }
}
