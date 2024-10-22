import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, input, model, TemplateRef } from '@angular/core';
import { TAB_DIALOG_REF } from './dialog.ref';
import { ButtonComponent } from '../button/button.component';

@Component({
    imports: [CommonModule, ButtonComponent],
    template: `
        <div class="dialog-content">
            <div *ngIf="contentTemplate(); else textContent">
                <ng-container *ngTemplateOutlet="contentTemplate()!"></ng-container>
            </div>
            <ng-template #textContent>
                <div>{{ content() }}</div>
            </ng-template>
        </div>
        <div class="dialog-actions">
            <tab-button (click)="dialogRef.close(false)">
                {{ cancelBtnText() }}
            </tab-button>
            <tab-button [color]="color()" (click)="dialogRef.close(true)">
                {{ acceptBtnText() }}
            </tab-button>
        </div>
    `,
    standalone: true,
    styles: [`
        .dialog-content {
            padding: 12px 18px;
        }
        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1em;
            padding: 12px;
            padding-top: 0;
        }
        `],
})
export class ConfirmationDialogComponent {
    color = model<'primary' | 'error' | 'secondary'>('secondary');
    content = model<string>();
    contentTemplate = model<TemplateRef<any>>();
    acceptBtnText = model<string>('OK');
    cancelBtnText = model<string>('Cancel');

    dialogRef = inject(TAB_DIALOG_REF);
}
