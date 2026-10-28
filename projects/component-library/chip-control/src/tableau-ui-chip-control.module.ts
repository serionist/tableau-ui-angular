import { NgModule } from '@angular/core';
import { ChipControlComponent } from './components/chip-control.component';
import { ChipTemplateDirective } from './directives/chip-template.directive';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [TableauUiCommonModule, CommonModule],
  declarations: [ChipControlComponent, ChipTemplateDirective],
  exports: [ChipControlComponent, ChipTemplateDirective],
})
export class TableauUiChipControlModule {}
