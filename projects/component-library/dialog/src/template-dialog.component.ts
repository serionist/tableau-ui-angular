import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { TAB_DATA_REF } from './data.ref';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tab-template-dialog',
    imports: [CommonModule],
    standalone: true,
    template: `
        <ng-container [ngTemplateOutlet]="data.contentTemplate" [ngTemplateOutletContext]="data.contentTemplateContext" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateDialogComponent<TData> {
    data = inject<{
        contentTemplate: TemplateRef<TData>;
        contentTemplateContext: TData;
    }>(TAB_DATA_REF);
}
