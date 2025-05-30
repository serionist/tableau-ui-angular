import { Component, inject } from '@angular/core';
import { ExampleSnackComponent } from './example-snack.component';
import { SnackRef, SnackService } from 'component-library';


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
        type: 'info' | 'error' | 'success'= 'info',
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

    snackAction(snackRef: SnackRef) {
        snackRef.close();
        this.snackService.openSnack('Action executed!', 3000, 'info', 'top');
    }
}
