import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    input,
    model,
    ModelSignal,
    TemplateRef,
    ViewChild,
    viewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { TAB_DIALOG_REF } from './dialog.ref';
import { TAB_DATA_REF } from './data.ref';

@Component({
    template: `
        <div class="dialog-content">
            <div *ngIf="data.contentTemplate; else textContent">
                <ng-container
                    *ngTemplateOutlet="data.contentTemplate"
                ></ng-container>
            </div>
            <ng-template #textContent>
                <div>{{ data.content }}</div>
            </ng-template>
        </div>
        <div class="dialog-actions">
            <button (click)="dialogRef.close(false)" #cancel tabindex="0">
                {{ data.cancelBtnText ?? 'Cancel' }}
            </button>
            <button
                [color]="data.color"
                (click)="dialogRef.close(true)"
                #accept
                tabindex="0"
            >
                {{ data.acceptBtnText ?? 'OK' }}
            </button>
        </div>
    `,
    styles: [
        `
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
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class ConfirmationDialogComponent implements AfterViewInit, AfterContentInit{

    data = inject<IConfirmationDialogData>(TAB_DATA_REF);

    dialogRef = inject(TAB_DIALOG_REF);

    accept = viewChild.required<ButtonComponent>('accept');
    cancel = viewChild.required<ButtonComponent>('cancel');

    ngAfterContentInit() {
        if (this.data.autofocus === 'accept') {
            const acc = this.accept();
            this.accept().nativeElement.nativeElement.focus();
        } else if (this.data.autofocus === 'cancel') {
            this.cancel().nativeElement.nativeElement.focus();
        }
    }
    ngAfterViewInit() {
        if (this.data.autofocus === 'accept') {
            const acc = this.accept().nativeElement;
            this.accept().nativeElement.nativeElement.focus();
        } else if (this.data.autofocus === 'cancel') {
            this.cancel().nativeElement.nativeElement.focus();
        }
    }
}

export class IConfirmationDialogData {
    content: string | undefined;
    contentTemplate: TemplateRef<any> | undefined;
    contentTemplateContext: any | undefined;
    color: 'primary' | 'error' | 'secondary' = 'secondary';
    acceptBtnText: string | undefined;
    cancelBtnText: string | undefined;
    autofocus: 'accept' | 'cancel' | undefined;
}
