import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';

@Component({
    selector: 'tab-label',
    standalone: false,
    template: `
        <ng-content />
    `,
    styles: `
        :host {
            color: var(--twc-color-text-light);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLabelComponent {}
