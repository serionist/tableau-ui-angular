import { Component, inject } from '@angular/core';
import { SnackService } from 'component-library';

@Component({
    selector: 'app-buttons-page',
    templateUrl: './expansion-page.component.html',
    styleUrl: './expansion-page.component.scss',
    standalone: false
})
export class ExpansionPageComponent {

  snack = inject(SnackService);
  specialButtonClick(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.snack.openSnack("Button clicked", 5000);
  }
}
