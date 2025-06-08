import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model } from '@angular/core';

@Component({
    selector: 'tab-hint',
    standalone: false,
    template: `
        <div class="tab-hint" [ngClass]="$type()"><ng-content /></div>
    `,
    styles: `
        .tab-hint {
            font-size: 0.9em;
            color: var(--twc-color-text-gray);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HintComponent {
    readonly $type = input<'prefix' | 'suffix'>('prefix', {
        alias: 'type',
    });
    readonly $showOnError = input<boolean>(false, {
        alias: 'showOnError',
    });
}
