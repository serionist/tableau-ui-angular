import { CommonModule } from '@angular/common';
import { Component, ContentChild, ElementRef, input, TemplateRef, ViewChild } from '@angular/core';
import { HintComponent } from './hint';

@Component({
    selector: 'tab-option',
    standalone: true,
    imports: [CommonModule],
    template: `<ng-template #templateRef>
        <div class="tab-option">
            <ng-content></ng-content>
            @if (hintElement) {
            <ng-content select="tab-hint"></ng-content>
            }
        </div>
    </ng-template>`,
    styles: `
        .tab-option {
            line-height: 14px;
        }
        .tab-hint {
            font-size: 0.9em;
            color: var(--twc-color-text-gray);
        }
    `
})
export class OptionComponent {
    value = input.required<any>();
    disabled = input<boolean>(false);
    @ContentChild(HintComponent, { static: false }) hintElement: ElementRef | undefined;
    @ViewChild('templateRef', { static: true }) template!: TemplateRef<any>;

    constructor(public elementRef: ElementRef) {}
}
