import { Component, inject } from '@angular/core';
import { SnackService } from '../../../../../component-library/src/public-api';

@Component({
    selector: 'app-buttons-page',
    templateUrl: './buttons-page.component.html',
    styleUrl: './buttons-page.component.scss',
})
export class ButtonsPageComponent {

  snack = inject(SnackService);

    buttonsLoading = {
        primary: false,
        secondary: false,
        error: false,
    };
    async buttonClick(color: 'primary' | 'secondary' | 'error') {
        this.buttonsLoading[color] = true;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.buttonsLoading[color] = false;
        console.log('Button clicked', color);
        this.snack.openSnack(`Button ${color} clicked`, 2000, color === 'error' ? 'error' : 'info');

    }
}