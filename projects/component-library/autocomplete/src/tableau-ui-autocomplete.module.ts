import { NgModule } from '@angular/core';
import { AutoCompleteComponent } from './autocomplete.component';
import { CommonModule } from '@angular/common';
import { AutoCompleteDirective } from './autocomplete.directive';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiDialogModule } from 'tableau-ui-angular/dialog';

@NgModule({
  imports: [TableauUiCommonModule, CommonModule, TableauUiDialogModule],
  declarations: [AutoCompleteComponent, AutoCompleteDirective],
  exports: [AutoCompleteComponent, AutoCompleteDirective],
})
export class TableauUiAutoCompleteModule {}
