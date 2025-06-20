import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiChipModule } from 'tableau-ui-angular/chip';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@Component({
  selector: 'app-chip-page',
  imports: [TableauUiChipModule, TableauUiIconModule, TableauUiCommonModule],
  standalone: true,
  templateUrl: './chip-page.component.html',
  styleUrl: './chip-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipPageComponent {
  
}
