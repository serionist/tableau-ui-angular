import { Component, inject, Inject, input, Input, model } from '@angular/core';
import { DialogRef, TAB_DIALOG_REF } from '../../../component-library/src/public-api';

@Component({
    selector: 'app-example-dialog',
    template: `
        <div class="dialog-content">
            <h2>Example Dialog</h2>
            <p>{{ message() }}</p>
            <button (click)="closeDialog()">Close</button>
        </div>
    `
})
export class ExampleDialogComponent {
    message = model.required<string>();
    dialogRef = inject(TAB_DIALOG_REF);

    closeDialog(): void {
        this.dialogRef.close('Dialog closed with this result');
    }
}