import { ChangeDetectionStrategy, Component, inject, Inject, input, Input, model } from '@angular/core';
import { SnackRef, TAB_SNACK_DATA_REF, TAB_SNACK_REF } from 'component-library';

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
    snackRef = inject(TAB_SNACK_REF);
    snackData = inject<{ message: string }>(TAB_SNACK_DATA_REF);

    closeDialog(): void {
        this.snackRef.close('Snack closed with this result');
    }
}
