import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';

@Component({
  selector: 'app-tooltip-template-example',
  imports: [TableauUiButtonModule, TableauUiTooltipModule],
  templateUrl: './tooltip-template.example.html',
  styleUrl: './tooltip-template.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipTemplateExampleComponent {}
