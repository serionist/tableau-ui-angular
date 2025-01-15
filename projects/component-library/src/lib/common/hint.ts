import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model } from '@angular/core';

@Component({
    selector: 'tab-hint',
    template: `<div class="tab-hint" [ngClass]="type()"><ng-content></ng-content></div>`,
    styles: `
        .tab-hint {
            font-size: 0.9em;
            color: var(--twc-color-text-gray);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HintComponent {
    type = input<'prefix' | 'suffix'>('prefix');
    elementRef = inject(ElementRef);

}
