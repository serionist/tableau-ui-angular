import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators } from '@angular/forms';
import { skip } from 'rxjs';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiSelectModule } from 'tableau-ui-angular/select';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-select-multi-example',
  imports: [TableauUiCommonModule, TableauUiFormModule, TableauUiFormFieldModule, TableauUiSelectModule],
  templateUrl: './select-multi.example.html',
  styleUrl: './select-multi.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMultiExampleComponent {
  private readonly fb = inject(FB);
  private readonly snacks = inject(SnackService);

  // Both selects share this control, so a pick in one shows in the other
  protected readonly values = this.fb.control<number[] | null>([1, 3], [Validators.required]);

  constructor() {
    this.values.value$.pipe(skip(1), takeUntilDestroyed()).subscribe(values => {
      this.snacks.openSnack(`Multi select value changed to: ${values?.join(', ') ?? '[none]'}`, 2000, 'info');
    });
  }
}
