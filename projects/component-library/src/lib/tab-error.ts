import { Component } from '@angular/core';

@Component({
  selector: 'tab-error',
  standalone: true,
  template: `<div class="tab-error"><ng-content></ng-content></div>`,
    styles: `
        .tab-error {
            font-size: 0.9em;
            color: var(--twc-color-error);
        }
    `
})
export class TabErrorComponent {}
