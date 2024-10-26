import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'tab-error',
  template: `<div class="tab-error"><ng-content></ng-content></div>`,
    styles: `
        .tab-error {
            font-size: 0.9em;
            color: var(--twc-color-error);
        }
    `
})
export class ErrorComponent {
    constructor(public elementRef: ElementRef) {}
}
