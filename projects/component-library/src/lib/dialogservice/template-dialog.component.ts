import { ChangeDetectionStrategy, Component, inject, model, TemplateRef } from '@angular/core';
import { TAB_DATA_REF } from './data.ref';


@Component({
    template: `<ng-container
        ]
        [ngTemplateOutlet]="data.contentTemplate"
        [ngTemplateOutletContext]="data.contentTemplateContext"
    ></ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TemplateDialogComponent<TData = any> {

    data = inject<{
        contentTemplate: TemplateRef<TData>;
        contentTemplateContext: TData;
    }>(TAB_DATA_REF);

}
