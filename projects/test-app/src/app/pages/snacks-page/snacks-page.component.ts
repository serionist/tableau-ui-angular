import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExampleSnackComponent } from './example-snack.component';
import type { SnackRef } from 'tableau-ui-angular/snack';
import { SnackService, TableauUiSnackModule } from 'tableau-ui-angular/snack';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';

@Component({
  selector: 'app-snacks-page',
  imports: [TableauUiCommonModule, TableauUiButtonModule, TableauUiSnackModule, TableauUiCheckboxModule],
  standalone: true,
  templateUrl: './snacks-page.component.html',
  styleUrl: './snacks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnacksPageComponent {
  snackService = inject(SnackService);

  openCustomSnack(duration: number | undefined = 5000, type: 'error' | 'info' | 'success' = 'info', location: 'bottom' | 'top' = 'top') {
    const snackRef = this.snackService.openSnackComponent<ExampleSnackComponent, { message: string }, string>(
      ExampleSnackComponent,
      { message: 'This is a custom snack compoenent' },
      duration,
      type,
      location,
    );
    snackRef.closed$.subscribe(result => {
      console.log('Snack closed with result:', result);
    });
  }

  snackAction(snackRef: SnackRef<boolean>) {
    snackRef.close();
    this.snackService.openSnack('Action executed!', 3000, 'info', 'top');
  }
}
