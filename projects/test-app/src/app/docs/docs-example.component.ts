import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TableauUiTabgroupModule } from 'tableau-ui-angular/tab-group';
import { DocsCodeComponent } from './docs-code.component';
import type { DocsExample } from './docs-example';
import { exampleFiles } from './docs-example';

/** A sample running, and its source below it: a tab for each of its files, each with a copy button */
@Component({
  selector: 'app-docs-example',
  imports: [NgComponentOutlet, TableauUiTabgroupModule, DocsCodeComponent],
  templateUrl: './docs-example.component.html',
  styleUrl: './docs-example.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsExampleComponent {
  readonly $example = input.required<DocsExample>({ alias: 'example' });

  protected readonly $files = computed(() => exampleFiles(this.$example()));
}
