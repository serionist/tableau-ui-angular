import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectSnackData, injectSnackRef } from 'tableau-ui-angular/snack';

@Component({
    selector: 'app-example-snack',
    standalone: true,
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
