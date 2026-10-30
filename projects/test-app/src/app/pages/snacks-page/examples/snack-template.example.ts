import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { SnackService } from 'tableau-ui-angular/snack';

interface Upload {
  file: string;
}

@Component({
  selector: 'app-snack-template-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule],
  templateUrl: './snack-template.example.html',
  styleUrl: './snack-template.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackTemplateExampleComponent {
  private readonly snacks = inject(SnackService);

  // The template and its context, which its let- variables read
  protected open(template: TemplateRef<Upload>, type: 'error' | 'info' | 'success') {
    this.snacks.openSnackFromTemplate(template, { file: `report-${type}.csv` }, 5000, type);
  }
}
