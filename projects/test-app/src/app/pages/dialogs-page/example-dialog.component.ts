import type { Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService, injectDialogData, injectDialogRef } from 'tableau-ui-angular/dialog';

@Component({
    selector: 'app-example-dialog',
    standalone: true,
    template: `
        <!-- eslint-disable  @angular-eslint/template/no-inline-styles -->
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
    providers: [DialogService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleDialogComponent {
    readonly $message: Signal<string>;
    dialogService = inject(DialogService);

    // Injecting the DialogRef and data using inject() function
    data = injectDialogData<string>();
    dialogRef = injectDialogRef<string>();
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
        this.dialogService.openModal(ExampleDialogComponent, 'Another dialog', {
            height: 'auto',
        });
    }
}
