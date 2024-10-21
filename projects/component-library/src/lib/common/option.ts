import { CommonModule } from '@angular/common';
import { Component, ContentChild, ElementRef, input, signal, TemplateRef, ViewChild } from '@angular/core';
import { HintComponent } from './hint';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'tab-option',
    standalone: true,
    imports: [CommonModule, IconComponent, HintComponent],
    template: `<ng-template #templateRef>
        <div class="tab-option">
            @if (iconElement && renderIcon) {
                <ng-content select="tab-icon"></ng-content>
            }
            <div class="content"><ng-content></ng-content></div>
            @if (hintElement && renderHint) {
            <div class="hint">
                <ng-content select="tab-hint"></ng-content>
            </div>
            }
        </div>
    </ng-template>`,
    styles: `
        .tab-option {
            display: grid;
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            line-height: 1.2;
            align-items: center;
        }
        ::ng-deep tab-icon {
            grid-column: 1;
            grid-row: 1;
            margin-right: 2px;
            font-size: 14px;
            margin-top: 2px;
        }
        .content {
            grid-column: 2;
            font-size: 12px;
            grid-row: 1;
        }
        .hint {
            grid-column: 2;
            grid-row: 2;
            font-size: 0.9em;
            color: var(--twc-color-text-gray);
        }
    `
})
export class OptionComponent {
    value = input.required<any>();
    disabled = input<boolean>(false);
    @ContentChild(HintComponent, { static: false }) hintElement: ElementRef | undefined;
    @ContentChild(IconComponent, { static: false }) iconElement: ElementRef | undefined;
    @ViewChild('templateRef', { static: true }) template!: TemplateRef<any>;

    renderIcon = true;
    renderHint = true;
    getTemplate(renderIcon: boolean = true, renderHint: boolean = true) {
        this.renderIcon = renderIcon;
        this.renderHint = renderHint;
        return this.template;
    }

    constructor(public elementRef: ElementRef) {}
}
