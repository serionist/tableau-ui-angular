import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';
import { SelectComponent } from './select.component';
import { TableauUiButtonModule } from '../button/tableau-ui-button.module';
import { TableauUiDialogModule } from '../dialogservice/tableau-ui-dialog.module';
import { IsSelectedValuePipe } from './pipes/is-selected-value.pipe';
import { MultipleTemplatePipe } from './pipes/multiple-template.pipe';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, TableauUiIconModule, TableauUiButtonModule, TableauUiDialogModule],
    declarations: [SelectComponent, IsSelectedValuePipe, MultipleTemplatePipe],
    exports: [SelectComponent],
})
export class TableauUiSelectModule {}
