import { Component, ElementRef } from "@angular/core";

@Component({
    selector: 'tab-label',
    standalone: true,
    template: `<div class="tab-label"><ng-content></ng-content></div>`,
      styles: `
          .tab-label {
              color: var(--twc-color-text-gray);
          }
      `
  })
  export class FormLabelComponent {
    constructor(public elementRef: ElementRef) {}
  }
  