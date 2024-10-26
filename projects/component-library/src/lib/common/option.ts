import { CommonModule } from '@angular/common';
import { Component, ContentChild, ElementRef, input, signal, TemplateRef, ViewChild } from '@angular/core';
import { HintComponent } from './hint';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'tab-option',
    template: `<ng-template #templateRef>
        <div class="tab-option">
            @if (iconElement && renderIcon) {
                <ng-content select="tab-icon"></ng-content>
            }
            @if (renderText) {
                <div class="content"><ng-content></ng-content></div>
            }
           
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
        .tab-option ::ng-deep tab-icon {
            grid-column: 1;
            grid-row: 1;
        }
        .content {
            grid-column: 2;
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
    @ViewChild('templateRef', { static: true }) private template!: TemplateRef<any>;

    renderIcon = true;
    renderHint = true;
    renderText = true;
    getTemplate(renderIcon: boolean = true, renderHint: boolean = true, renderText: boolean = true) {
        this.renderIcon = renderIcon;
        this.renderHint = renderHint;
        this.renderText = renderText;
        console.log('gettemplate')
        return this.template;
    }

    constructor(public elementRef: ElementRef) {}
}
