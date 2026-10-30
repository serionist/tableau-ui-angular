import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-form-field-value-example',
  imports: [TableauUiCommonModule, TableauUiFormFieldModule, TableauUiIconModule],
  templateUrl: './form-field-value.example.html',
  styleUrl: './form-field-value.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldValueExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly $typed = signal('');

  // (input) fires on each key, (change) when the user leaves the field after changing it
  protected input(event: Event) {
    this.$typed.set((event.target as HTMLInputElement).value);
  }

  protected changed(event: Event) {
    this.snacks.openSnack(`Simple textbox set to: ${(event.target as HTMLInputElement).value || '<empty>'}`, 3000, 'info');
  }
}
