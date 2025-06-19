import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IsValueSelectedPipe } from './pipes/is-value-selected.pipe';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { ListSingleSelectComponent } from './list-single-select.component';
import { ListMultiSelectComponent } from './list-multi-select.component';

@NgModule({
  imports: [CommonModule, TableauUiCommonModule, TableauUiIconModule],
  declarations: [IsValueSelectedPipe, ListSingleSelectComponent, ListMultiSelectComponent],
  exports: [ListSingleSelectComponent, ListMultiSelectComponent],
})
export class TableauUiListModule {}
