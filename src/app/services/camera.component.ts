import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Vista de la càmera</h2>
    <video #videoElement autoplay playsinline></video>
  `,
  styles: [`
    video {
      width: 100%;
      max-width: 600px;
      border: 2px solid #333;
      border-radius: 8px;
    }
  `]
})
export class CameraComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
        .then((stream) => {
          this.videoElement.nativeElement.srcObject = stream;
        })
        .catch((err) => {
          console.error("Error en accedir a la càmera externa:", err);
          alert("No s'ha pogut accedir a la càmera externa, provant la predeterminada.");

          // Si no funciona la càmera externa, prova la càmera per defecte:
          navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
              this.videoElement.nativeElement.srcObject = stream;
            })
            .catch((err) => {
              console.error("Error en accedir a la càmera per defecte:", err);
              alert("No s'ha pogut accedir a cap càmera.");
            });
        });
    } else {
      alert("El teu navegador no suporta accés a la càmera.");
    }
  }
}
