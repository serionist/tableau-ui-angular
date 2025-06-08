import { ChangeDetectionStrategy, Component, inject, Inject, input, Input, model } from '@angular/core';
import { injectSnackData, injectSnackRef, SnackRef } from 'component-library';

@Component({
    selector: 'app-example-snack',
    standalone: false,
    template: `
        <div class="dialog-content">
            <h2>Example Snack</h2>
            <p>{{ snackData.message }}</p>
            <button (click)="closeDialog()">Close</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleSnackComponent {
    snackRef = injectSnackRef<string>();
    snackData = injectSnackData<{ message: string }>();

    closeDialog(): void {
        this.snackRef.close('Snack closed with this result');
    }
}
