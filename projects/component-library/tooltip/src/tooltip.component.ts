import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectDialogData } from 'tableau-ui-angular/dialog';

@Component({
    selector: 'tab-tooltip',
    standalone: false,
    template: `
        @if (stringTooltip !== undefined) {
            <div class="string-value">
                {{ stringTooltip }}
            </div>
        } @else if (templateTooltip !== undefined) {
            <ng-container [ngTemplateOutlet]="templateTooltip" [ngTemplateOutletContext]="dialogData.tooltipContext" />
        }
    `,
    styles: `
        .string-value {
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent<T> {
    readonly dialogData = injectDialogData<TooltipComponentArgs<T>>();

    readonly stringTooltip: string | undefined;
    readonly templateTooltip: TemplateRef<T> | undefined;
    constructor() {
        console.log('TooltipComponent initialized with data:', this.dialogData);
        if (typeof this.dialogData.tooltip === 'string') {
            this.stringTooltip = this.dialogData.tooltip;
            this.templateTooltip = undefined;
        } else {
            this.stringTooltip = undefined;
            this.templateTooltip = this.dialogData.tooltip;
        }
    }
}
export interface TooltipComponentArgs<T> {
    tooltip: TemplateRef<T> | string;
    tooltipContext: T;
    padding: string;
}
