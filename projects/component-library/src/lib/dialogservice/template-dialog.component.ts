import { ChangeDetectionStrategy, Component, model, TemplateRef } from '@angular/core';

@Component({
    template: `<ng-container
        [ngTemplateOutlet]="contentTemplate()"
        [ngTemplateOutletContext]="contentTemplateContext()"
        ]
    ></ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TemplateDialogComponent {
    contentTemplate = model.required<TemplateRef<any>>();
    contentTemplateContext = model<any>();
}
