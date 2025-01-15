import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

@Component({
    selector: 'tab-error',
    template: `<div class="tab-error"><ng-content></ng-content></div>`,
    styles: `
        .tab-error {
            font-size: 0.9em;
            color: var(--twc-color-error);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ErrorComponent {
    elementRef = inject(ElementRef);
}
