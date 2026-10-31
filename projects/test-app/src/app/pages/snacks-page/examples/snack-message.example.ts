import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-snack-message-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule],
  templateUrl: './snack-message.example.html',
  styleUrl: './snack-message.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackMessageExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly $bottom = signal(false);
  protected readonly $untilClosed = signal(false);

  // A duration of 0 keeps the snack until the user closes it
  protected open(type: 'error' | 'info' | 'success') {
    const duration = this.$untilClosed() ? 0 : 5000;
    this.snacks.openSnack(`A snack of type ${type}`, duration, type, this.$bottom() ? 'bottom' : 'top');
  }
}
