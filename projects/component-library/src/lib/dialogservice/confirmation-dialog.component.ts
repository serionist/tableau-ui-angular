import { CommonModule, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, input, model, TemplateRef, ViewChild, viewChild } from '@angular/core';
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
            <button (click)="dialogRef.close(false)" #cancel>
                {{ cancelBtnText() }}
            </button>
            <button [color]="color()" (click)="dialogRef.close(true)" #accept>
                {{ acceptBtnText() }}
            </button>
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
export class ConfirmationDialogComponent implements AfterViewInit {
    color = model<'primary' | 'error' | 'secondary'>('secondary');
    content = model<string>();
    contentTemplate = model<TemplateRef<any>>();
    acceptBtnText = model<string>('OK');
    cancelBtnText = model<string>('Cancel');
    autofocus = model<'accept' | 'cancel' | undefined>();

    dialogRef = inject(TAB_DIALOG_REF);

    @ViewChild('accept', { read: ElementRef }) accept: ElementRef | undefined;
    @ViewChild('cancel', { read: ElementRef }) cancel: ElementRef | undefined;

    ngAfterViewInit() {
        if (this.autofocus() === 'accept') {
            this.accept!.nativeElement.focus();
        } else if (this.autofocus() === 'cancel') {
            this.cancel!.nativeElement.focus();
        }
    }
}