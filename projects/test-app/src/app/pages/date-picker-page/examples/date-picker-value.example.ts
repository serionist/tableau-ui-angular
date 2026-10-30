import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiDatePickerModule } from 'tableau-ui-angular/date-picker';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';

@Component({
  selector: 'app-date-picker-value-example',
  imports: [TableauUiCommonModule, TableauUiDatePickerModule, TableauUiFormFieldModule],
  templateUrl: './date-picker-value.example.html',
  styleUrl: './date-picker-value.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerValueExampleComponent {
  // A Date, or undefined while the input is empty or holds no whole date
  protected readonly $day = signal<Date | undefined>(undefined);
  protected readonly $meeting = signal<Date | undefined>(undefined);

  // The value is in local time; toISOString() gives it in UTC
  protected readonly $dayUtc = computed(() => this.$day()?.toISOString() ?? 'no date');
  protected readonly $meetingUtc = computed(() => this.$meeting()?.toISOString() ?? 'no date');
}
