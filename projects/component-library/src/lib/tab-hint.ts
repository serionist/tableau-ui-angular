import { Component } from '@angular/core';

@Component({
  selector: 'tab-hint',
  standalone: true,
  template: `<div class="tab-hint"><ng-content></ng-content></div>`,
    styles: `
        .tab-hint {
            font-size: 0.9em;
            color: var(--twc-color-text-gray);
        }
    `
})
export class TabHintComponent {}
