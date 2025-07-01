import { Component, OnInit } from '@angular/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-ar-viewer',
  templateUrl: './ar-viewer.component.html',
  styleUrls: ['./ar-viewer.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // <-- aquí està la clau!

})

export class ArViewerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
