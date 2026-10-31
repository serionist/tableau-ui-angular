import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiRadioGroupModule } from 'tableau-ui-angular/radio-group';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-radio-value-example',
  imports: [TableauUiCommonModule, TableauUiRadioGroupModule],
  templateUrl: './radio-value.example.html',
  styleUrl: './radio-value.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioValueExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly $plan = signal<number | undefined>(1);

  // valueChange fires on each pick by the user, never when the app sets the value
  protected changed(value: number | undefined) {
    this.snacks.openSnack(`Radio group set to: ${value}`, 3000, 'info');
  }
}
