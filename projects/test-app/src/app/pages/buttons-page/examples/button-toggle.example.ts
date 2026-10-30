import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-button-toggle-example',
  imports: [TableauUiButtonToggleModule, TableauUiCommonModule],
  templateUrl: './button-toggle.example.html',
  styleUrl: './button-toggle.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleExampleComponent {
  private readonly snacks = inject(SnackService);

  // It starts on a disabled option, which the user can't pick again once they leave it
  protected readonly $alignment = signal<string | undefined>('left');

  protected changed(alignment: string | undefined) {
    this.snacks.openSnack(`Button toggle value changed: ${alignment ?? '[undefined]'}`, 2000, 'info');
  }
}
