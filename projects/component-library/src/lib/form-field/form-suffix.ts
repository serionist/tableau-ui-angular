import { Component, ElementRef } from "@angular/core";

@Component({
    selector: 'tab-suffix',
    template: `<ng-content></ng-content>`,
      styles: `
      
      `
  })
  export class FormSuffixComponent {
    constructor(public elementRef: ElementRef) {}
  }
  