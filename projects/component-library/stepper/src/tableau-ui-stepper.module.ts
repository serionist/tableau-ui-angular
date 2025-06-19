import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiUtilsModule } from 'tableau-ui-angular/utils';
import { StepperComponent } from './stepper/stepper.component';
import { StepComponent } from './step/step.component';

@NgModule({
  imports: [CommonModule, TableauUiIconModule, TableauUiUtilsModule],
  declarations: [StepperComponent, StepComponent],
  exports: [StepperComponent, StepComponent],
})
export class TableauUiStepperModule {}
