import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-checkbox-partial-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule, TableauUiCommonModule],
  templateUrl: './checkbox-partial.example.html',
  styleUrl: './checkbox-partial.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPartialExampleComponent {
  private readonly snacks = inject(SnackService);

  // Only the app sets 'partial': a click goes to valueAfterPartial, false unless it says true
  protected readonly $toFalse = signal<boolean | 'partial'>('partial');
  protected readonly $toTrue = signal<boolean | 'partial'>('partial');

  protected changed(name: string, value: boolean | 'partial') {
    this.snacks.openSnack(`${name} set to: ${value}`, 3000, 'info');
  }
}
