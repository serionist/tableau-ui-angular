import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { DialogService } from 'tableau-ui-angular/dialog';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-dialog-confirm-example',
  imports: [TableauUiButtonModule],
  templateUrl: './dialog-confirm.example.html',
  styleUrl: './dialog-confirm.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmExampleComponent {
  private readonly dialogs = inject(DialogService);
  private readonly snacks = inject(SnackService);

  // Resolves true when the user accepts, false when they cancel or close it
  protected async confirm(color: 'error' | 'primary' | 'secondary', autofocus?: 'accept' | 'cancel') {
    const accepted = await this.dialogs.openConfirmationMessageDialog(
      'Delete the item?',
      'Are you sure you want to delete this item? It goes for good, and this text runs to two lines to show how the dialog wraps.',
      color,
      undefined,
      undefined,
      autofocus,
    );
    this.snacks.openSnack(accepted ? 'Accepted' : 'Cancelled', 2000, 'info');
  }
}
