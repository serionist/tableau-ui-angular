import { Component, ElementRef } from "@angular/core";

@Component({
    selector: 'tab-prefix',
    template: `<ng-content></ng-content>`,
      styles: `
      
      `
  })
  export class FormPrefixComponent {
    constructor(public elementRef: ElementRef) {}
  }
  