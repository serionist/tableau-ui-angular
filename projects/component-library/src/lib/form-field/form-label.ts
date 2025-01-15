import { ChangeDetectionStrategy, Component, ElementRef } from "@angular/core";

@Component({
    selector: 'tab-label',
    template: `<div class="tab-label"><ng-content></ng-content></div>`,
    styles: `
          .tab-label {
              color: var(--twc-color-text-light);
          }
      `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
  export class FormLabelComponent {
    constructor(public elementRef: ElementRef) {}
  }
  