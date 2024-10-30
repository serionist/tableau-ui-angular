import { Component, inject } from '@angular/core';
import { SnackService } from '../../../../../component-library/src/public-api';

@Component({
  selector: 'app-select-page',
  templateUrl: './select-page.component.html',
  styleUrl: './select-page.component.scss'
})
export class SelectPageComponent {

    snack = inject(SnackService);

    singleSelectValue = '1';
    singleSelectValueChanged(val: string) {
        console.log('single select value changed', val);
        this.snack.openSnack('Single select value changed to: ' + val);
    }
}
