import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import type { SnackRef } from 'tableau-ui-angular/snack';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-snack-action-example',
  imports: [TableauUiButtonModule],
  templateUrl: './snack-action.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackActionExampleComponent {
  private readonly snacks = inject(SnackService);

  protected delete() {
    this.snacks.openSnackWithAction(
      'Deleted the report',
      'Undo',
      snack => {
        this.undo(snack);
      },
      5000,
      'success',
    );
  }

  // The action gets the snack, which stays open until the action closes it
  private undo(snack: SnackRef<boolean>) {
    snack.close();
    this.snacks.openSnack('Restored the report', 3000, 'info');
  }
}
