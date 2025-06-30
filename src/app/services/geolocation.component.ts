import { Component } from '@angular/core';

@Component({
  selector: 'app-geolocation',
  imports: [],
  template: ``,
  styles: ''
})
export class GeolocationComponent {
  ngOnInit(){
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Latitud:", position.coords.latitude);
          console.log("Longitud:", position.coords.longitude);
        },
        (error) => {
          console.error("Error en obtenir la ubicació:", error.message);
        }
      );
    } else {
      console.error("La geolocalització no està disponible al teu navegador.");
    }

  }

}
