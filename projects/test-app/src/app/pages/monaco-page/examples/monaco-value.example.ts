import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import type { MonacoConstructionOptions } from 'tableau-ui-angular/monaco';
import { TableauUiMonacoModule } from 'tableau-ui-angular/monaco';

@Component({
  selector: 'app-monaco-value-example',
  imports: [TableauUiMonacoModule],
  templateUrl: './monaco-value.example.html',
  styleUrl: './monaco-value.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonacoValueExampleComponent {
  protected readonly $json = signal('{\n  "name": "my-app",\n  "private": true\n}\n');

  // Monaco's own options; ariaLabel names its text box for screen readers
  protected readonly options: MonacoConstructionOptions = {
    ariaLabel: 'package.json',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  };

  protected readonly $valid = computed(() => {
    try {
      JSON.parse(this.$json());
      return true;
    } catch {
      return false;
    }
  });
}
