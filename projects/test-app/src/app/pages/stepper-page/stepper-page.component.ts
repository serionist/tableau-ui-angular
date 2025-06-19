import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiStepperModule } from 'tableau-ui-angular/stepper';

@Component({
  selector: 'app-stepper-page',
  imports: [TableauUiCommonModule, TableauUiStepperModule],
  standalone: true,
  templateUrl: './stepper-page.component.html',
  styleUrl: './stepper-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperPageComponent {}
