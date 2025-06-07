import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExampleSnackComponent } from './example-snack.component';
import type { SnackRef} from 'component-library';
import { SnackService } from 'component-library';

@Component({
    selector: 'app-snacks-page',
    standalone: false,
    templateUrl: './snacks-page.component.html',
    styleUrl: './snacks-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnacksPageComponent {
    snackService = inject(SnackService);
    async openCustomSnack(duration: number | undefined = 5000, type: 'info' | 'error' | 'success' = 'info', location: 'top' | 'bottom' = 'top') {
        const snackRef = this.snackService.openSnackComponent(ExampleSnackComponent, { message: 'This is a custom snack compoenent' }, duration, type, location);
        snackRef.afterClosed$.subscribe((result) => {
            console.log('Snack closed with result:', result);
        });
    }

    snackAction(snackRef: SnackRef) {
        snackRef.close();
        this.snackService.openSnack('Action executed!', 3000, 'info', 'top');
    }
}
