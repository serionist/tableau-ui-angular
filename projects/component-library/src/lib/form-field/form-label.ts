import { ChangeDetectionStrategy, Component, ElementRef } from "@angular/core";

@Component({
    selector: 'tab-label',
    template: `<ng-content />`,
    styles: `
          :host {
              color: var(--twc-color-text-light);
          }
      `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
  export class FormLabelComponent {
  }
  