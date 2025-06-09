import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
@Component({
    selector: 'tab-error',
    standalone: false,
    template: `
        <div class="tab-error"><ng-content /></div>
    `,
    styles: `
        .tab-error {
            font-size: 0.9em;
            color: var(--twc-color-error);
            font-weight: bold;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {}
