import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SelectComponent } from './select.component';
import { IsSelectedValuePipe } from './pipes/is-selected-value.pipe';
import { MultipleTemplatePipe } from './pipes/multiple-template.pipe';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiDialogModule } from 'tableau-ui-angular/dialog';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, TableauUiIconModule, TableauUiButtonModule, TableauUiDialogModule],
    declarations: [SelectComponent, IsSelectedValuePipe, MultipleTemplatePipe],
    exports: [SelectComponent],
})
export class TableauUiSelectModule {}
