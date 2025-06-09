import type { AfterContentInit, AfterViewInit, TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model, ModelSignal, ViewChild, viewChild } from '@angular/core';
import { injectDialogRef, TAB_DIALOG_REF } from './dialog.ref';
import { injectDialogData, TAB_DATA_REF } from './data.ref';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'tableau-ui-angular/button';

@Component({
    selector: 'tab-confirmation-dialog',
    imports: [CommonModule, ButtonComponent],
    standalone: true,
    template: `
        <div class="dialog-content">
            @if (data.contentTemplate) {
                <div>
                    <ng-container *ngTemplateOutlet="data.contentTemplate" />
                </div>
            } @else {
                <div>{{ data.content }}</div>
            }
        </div>
        <div class="dialog-actions">
            <button #cancel tabindex="0" (click)="dialogRef.close(false)">
                {{ data.cancelBtnText ?? 'Cancel' }}
            </button>
            <button #accept tabindex="0" [color]="data.color" (click)="dialogRef.close(true)">
                {{ data.acceptBtnText ?? 'OK' }}
            </button>
        </div>
    `,
    styles: `
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent implements AfterViewInit, AfterContentInit {
    protected data = inject<IConfirmationDialogData>(TAB_DATA_REF);

    protected readonly data2 = injectDialogData<IConfirmationDialogData>();

    protected dialogRef = injectDialogRef<boolean>();

    private readonly $accept = viewChild.required<ButtonComponent>('accept');
    private readonly $cancel = viewChild.required<ButtonComponent>('cancel');

    ngAfterContentInit() {
        if (this.data.autofocus === 'accept') {
            const acc = this.$accept();
            this.$accept().$nativeElement.nativeElement.focus();
        } else if (this.data.autofocus === 'cancel') {
            this.$cancel().$nativeElement.nativeElement.focus();
        }
    }
    ngAfterViewInit() {
        if (this.data.autofocus === 'accept') {
            const acc = this.$accept().$nativeElement;
            this.$accept().$nativeElement.nativeElement.focus();
        } else if (this.data.autofocus === 'cancel') {
            this.$cancel().$nativeElement.nativeElement.focus();
        }
    }
}

export class IConfirmationDialogData<T = unknown> {
    content: string | undefined;
    contentTemplate: TemplateRef<T> | undefined;
    contentTemplateContext: T | undefined;
    color: 'error' | 'primary' | 'secondary' = 'secondary';
    acceptBtnText: string | undefined;
    cancelBtnText: string | undefined;
    autofocus: 'accept' | 'cancel' | undefined;
}
