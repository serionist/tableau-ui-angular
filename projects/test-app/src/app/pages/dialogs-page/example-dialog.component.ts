import { Component, inject, Inject, input, Input, model } from '@angular/core';
import { DialogRef, DialogService, TAB_DIALOG_REF } from 'component-library';


@Component({
    selector: 'app-example-dialog',
    template: `
        <div class="dialog-content" style="
    padding: 1em 2em;">
            <h2>Example Dialog</h2>
            <p>{{ message() }}</p>
            <button (click)="openAnother()">Open another dialog</button>
            <button (click)="closeDialog()">Close</button>
        </div>
    `,
    standalone: false
})
export class ExampleDialogComponent {
    message = model.required<string>();
    dialogService = inject(DialogService);
    constructor(@Inject(TAB_DIALOG_REF) public dialogRef: DialogRef) {}

    closeDialog(): void {
        this.dialogRef.close('Dialog closed with this result');
    }

    openAnother() {
        this.dialogService.openModal(ExampleDialogComponent, { message: 'Another dialog' },
            {
                height: 'auto',
            }
        );
    }
}
