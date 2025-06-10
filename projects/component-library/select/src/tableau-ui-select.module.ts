import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IsSelectedValuePipe } from './pipes/is-selected-value.pipe';
import { MultipleTemplatePipe } from './pipes/multiple-template.pipe';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiDialogModule } from 'tableau-ui-angular/dialog';
import { SingleSelectComponent } from './single-select.component';
import { MultiSelectComponent } from './multi-select.component';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, TableauUiIconModule, TableauUiButtonModule, TableauUiDialogModule],
    declarations: [IsSelectedValuePipe, MultipleTemplatePipe, SingleSelectComponent, MultiSelectComponent],
    exports: [SingleSelectComponent, MultiSelectComponent],
})
export class TableauUiSelectModule {}
