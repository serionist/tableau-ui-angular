import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { skip } from 'rxjs';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiRadioGroupModule } from 'tableau-ui-angular/radio-group';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-radio-forms-example',
  imports: [AsyncPipe, ReactiveFormsModule, TableauUiCommonModule, TableauUiFormModule, TableauUiRadioGroupModule],
  templateUrl: './radio-forms.example.html',
  styleUrl: './radio-forms.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioFormsExampleComponent {
  private readonly fb = inject(FB);
  private readonly snacks = inject(SnackService);

  // Only 3 is valid: 1 is below the minimum, 2 is disabled, 4 is above the maximum. Each error waits for the control
  // to be touched, as formHasError does: once an option loses focus, at the second pick or on leaving the group
  protected readonly size = this.fb.control<number | null>(null, [Validators.required, Validators.min(2), Validators.max(3)]);

  constructor() {
    // value$ gives the current value first, which it skips; by the time it emits, the meta holds the new validity
    this.size.value$.pipe(skip(1), takeUntilDestroyed()).subscribe(value => {
      this.snacks.openSnack(`Size set to: ${value}`, 3000, this.size.$meta().validity === 'VALID' ? 'info' : 'error');
    });
  }
}
