import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-checkbox-value-example',
  imports: [TableauUiCheckboxModule, TableauUiCommonModule],
  templateUrl: './checkbox-value.example.html',
  styleUrl: './checkbox-value.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxValueExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly $simple = signal(true);
  protected readonly $withHint = signal(false);
  protected readonly $loadingValue = signal(false);
  protected readonly $loading = signal(false);

  // valueChange fires on each toggle by the user, never when the app sets the value
  protected changed(name: string, value: boolean | 'partial') {
    this.snacks.openSnack(`${name} set to: ${value}`, 3000, 'info');
  }

  // Shows the checkbox loading for two seconds after each toggle
  protected load(value: boolean | 'partial') {
    this.changed('Loading checkbox', value);
    this.$loading.set(true);
    setTimeout(() => {
      this.$loading.set(false);
    }, 2000);
  }
}
