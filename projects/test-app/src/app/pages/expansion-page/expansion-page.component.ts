import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';

import { TableauUiExpansionPanelModule } from 'tableau-ui-angular/expansion-panel';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService, TableauUiSnackModule } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-buttons-page',
  imports: [TableauUiSnackModule, TableauUiCommonModule, TableauUiExpansionPanelModule, TableauUiIconModule],
  standalone: true,
  templateUrl: './expansion-page.component.html',
  styleUrl: './expansion-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPageComponent {
  snack = inject(SnackService);

  specialButtonClick(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.snack.openSnack('Button clicked', 5000);
  }
}
