import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, input, model, TemplateRef, ViewChild, viewChild } from '@angular/core';
import { ButtonComponent, TAB_DIALOG_REF } from '../../public-api';

@Component({
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
            <button (click)="dialogRef.close(false)" #cancel tabindex="0">
                {{ cancelBtnText() }}
            </button>
            <button [color]="color()" (click)="dialogRef.close(true)" #accept tabindex="0">
                {{ acceptBtnText() }}
            </button>
        </div>
    `,
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent implements AfterViewInit {
    color = model<'primary' | 'error' | 'secondary'>('secondary');
    content = model<string>();
    contentTemplate = model<TemplateRef<any>>();
    acceptBtnText = model<string>('OK');
    cancelBtnText = model<string>('Cancel');
    autofocus = model<'accept' | 'cancel' | undefined>();

    dialogRef = inject(TAB_DIALOG_REF);

    accept = viewChild.required<ButtonComponent>('accept');
    cancel = viewChild.required<ButtonComponent>('cancel');
    
    ngAfterContentInit() {
        if (this.autofocus() === 'accept') {
            const acc = this.accept();
            this.accept().nativeElement.nativeElement.focus();
        } else if (this.autofocus() === 'cancel') {
            this.cancel().nativeElement.nativeElement.focus();
        }
    }
    ngAfterViewInit() {
        if (this.autofocus() === 'accept') {
            const acc = this.accept().nativeElement;
            this.accept().nativeElement.nativeElement.focus();
        } else if (this.autofocus() === 'cancel') {
            this.cancel().nativeElement.nativeElement.focus();
        }
    }
}
