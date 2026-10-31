import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';

@Component({
  selector: 'app-tooltip-text-example',
  imports: [TableauUiButtonModule, TableauUiTooltipModule],
  templateUrl: './tooltip-text.example.html',
  styleUrl: './tooltip-text.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipTextExampleComponent {}
