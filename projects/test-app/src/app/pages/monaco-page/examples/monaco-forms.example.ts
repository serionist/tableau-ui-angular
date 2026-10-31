import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import type { MonacoConstructionOptions } from 'tableau-ui-angular/monaco';
import { TableauUiMonacoModule } from 'tableau-ui-angular/monaco';

@Component({
  selector: 'app-monaco-forms-example',
  imports: [ReactiveFormsModule, TableauUiCheckboxModule, TableauUiFormModule, TableauUiMonacoModule],
  templateUrl: './monaco-forms.example.html',
  styleUrl: './monaco-forms.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonacoFormsExampleComponent {
  private readonly fb = inject(FB);

  protected readonly query = this.fb.control<string>('SELECT region, SUM(sales)\nFROM orders\nGROUP BY region\n');

  protected readonly options: MonacoConstructionOptions = {
    ariaLabel: 'Query',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  };

  // A disabled control makes the editor read-only
  protected setReadOnly(readOnly: boolean | 'partial') {
    if (readOnly === true) {
      this.query.metaFn.disable();
    } else {
      this.query.metaFn.enable();
    }
  }
}
