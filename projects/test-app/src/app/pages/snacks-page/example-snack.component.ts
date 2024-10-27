import { Component, inject, Inject, input, Input, model } from '@angular/core';
import { SnackRef, TAB_SNACK_REF } from '../../../../../component-library/src/public-api';


@Component({
    selector: 'app-example-snack',
    template: `
        <div class="dialog-content">
            <h2>Example Snack</h2>
            <p>{{ message() }}</p>
            <button (click)="closeDialog()">Close</button>
        </div>
    `
})
export class ExampleSnackComponent {
    message = model.required<string>();
    constructor(@Inject(TAB_SNACK_REF) public snackRef: SnackRef) {}

    closeDialog(): void {
        this.snackRef.close('Snack closed with this result');
    }
}
