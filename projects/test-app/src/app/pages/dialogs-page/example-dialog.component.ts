import { Component, inject, Inject, input, Input, model, signal, Signal } from '@angular/core';
import {
    DialogRef,
    DialogService,
    TAB_DATA_REF,
    TAB_DIALOG_REF,
} from 'component-library';

@Component({
    selector: 'app-example-dialog',
    template: `
        <div
            class="dialog-content"
            style="
    padding: 1em 2em;"
        >
            <h2>Example Dialog</h2>
            <p>{{ $message() }}</p>
            <button (click)="openAnother()">Open another dialog</button>
            <button (click)="closeDialog()">Close</button>
        </div>
    `,
    standalone: false,
})
export class ExampleDialogComponent {
    readonly $message: Signal<string>;
    dialogService = inject(DialogService);

    // Injecting the DialogRef and data using inject() function
    data = inject<string>(TAB_DATA_REF);
    dialogRef = inject(TAB_DIALOG_REF);
    constructor() {
        this.$message = signal(this.data);
    }
    // OR
    // constructor(
    //     @Inject(TAB_DIALOG_REF) public dialogRef: DialogRef,
    //     @Inject(getDataRef<string>()) public dataMessage: string
    // ) {
    //     this.message = signal(dataMessage);
    // }

    closeDialog(): void {
        this.dialogRef.close('Dialog closed with this result');
    }

    openAnother() {
        this.dialogService.openModal(
            ExampleDialogComponent,
            'Another dialog',
            {
                height: 'auto',
            }
        );
    }
}
