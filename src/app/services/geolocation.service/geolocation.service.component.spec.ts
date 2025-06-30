import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeolocationServiceComponent } from './geolocation.service.component';

describe('GeolocationServiceComponent', () => {
  let component: GeolocationServiceComponent;
  let fixture: ComponentFixture<GeolocationServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeolocationServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeolocationServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
