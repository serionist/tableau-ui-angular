import { Component, inject } from '@angular/core';
import { ExampleSnackComponent } from './example-snack.component';
import { SnackService } from '../../../../../component-library/src/public-api';

@Component({
    selector: 'app-snacks-page',
    templateUrl: './snacks-page.component.html',
    styleUrl: './snacks-page.component.scss',
    standalone: false
})
export class SnacksPageComponent {
    snackService = inject(SnackService);
    async openCustomSnack(
        duration: number | undefined = 5000,
        type: 'info' | 'error' = 'info',
        location: 'top' | 'bottom' = 'top'
    ) {
        const snackRef = await this.snackService.openSnackComponent(
            ExampleSnackComponent,
            { message: 'This is a custom snack compoenent' },
            duration,
            type,
            location
        );
        snackRef.afterClosed$.subscribe((result) => {
            console.log('Snack closed with result:', result);
        });
    }
}
