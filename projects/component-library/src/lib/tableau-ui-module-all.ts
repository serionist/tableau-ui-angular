import { NgModule } from '@angular/core';
import { TableauUiButtonModule } from './button/tableau-ui-button.module';
import { TableauUiCheckboxModule } from './checkbox/tableau-ui-checkbox.module';
import { TableauUiClipboardModule } from './clipboard/tableau-ui-clipboard.module';
import { TableauUiCommonModule } from './common/tableau-ui-common.module';
import { TableauUiDialogModule } from './dialogservice/tableau-ui-dialog.module';
import { TableauUiFormFieldModule } from './form-field/tableau-ui-form-field.module';
import { TableauUiIconModule } from './icon/tableau-ui-icon.module';
import { TableauUiNavBarModule } from './nav-bar/tableau-ui-nav-bar.module';
import { TableauUiRadioGroupModule } from './radiogroup/tableau-ui-radiogroup.module';
import { TableauUiSnackModule } from './snack/tableau-ui-snack.module';
import { TableauUiTabgroupModule } from './tabcontrol/tableau-ui-tabgroup.module';
import { TableauUiTooltipModule } from './tooltip/tableau-ui-tooltip.module';
import { TableauUiSelectModule } from './select/tableau-ui-select.module';
import { TableauUiListModule } from './list/tableau-ui-list.module';
import { TableauUiTreeModule } from './tree/tableau-ui-tree.module';
import { TableauUiAutoCompleteModule } from './autocomplete/tableau-ui-autocomplete.module';
import { TableauUiMenuModule } from './menu/tableau-ui-menu.module';
import { TableauUiDatePickerModule } from './date-picker/tableau-ui-date-picker.module';
import { TableauUiFormModule } from './form/tableau-ui-form.module';
import { TableauUiExpansionPanelModule } from './expansion-panel/tableau-ui-expansion-panel.module';
import { TableauUiArrowScrollModule } from './arrow-scroll/tableau-ui-arrow-scroll.module';
import { TableauUiTableModule } from './table/tableau-ui-table.module';

@NgModule({
    imports: [
        TableauUiButtonModule,
        TableauUiCheckboxModule,
        TableauUiClipboardModule,
        TableauUiCommonModule,
        TableauUiDialogModule,
        TableauUiFormFieldModule,
        TableauUiIconModule,
        TableauUiNavBarModule,
        TableauUiRadioGroupModule,
        TableauUiSnackModule,
        TableauUiTabgroupModule,
        TableauUiTooltipModule,
        TableauUiSelectModule,
        TableauUiListModule,
        TableauUiTreeModule,
        TableauUiAutoCompleteModule,
        TableauUiMenuModule,
        TableauUiDatePickerModule,
        TableauUiFormModule,
        TableauUiExpansionPanelModule,
        TableauUiArrowScrollModule,
        TableauUiTableModule
    ],
    declarations: [],
    exports: [ TableauUiButtonModule,
        TableauUiCheckboxModule,
        TableauUiClipboardModule,
        TableauUiCommonModule,
        TableauUiDialogModule,
        TableauUiFormFieldModule,
        TableauUiIconModule,
        TableauUiNavBarModule,
        TableauUiRadioGroupModule,
        TableauUiSnackModule,
        TableauUiTabgroupModule,
        TableauUiTooltipModule,
        TableauUiSelectModule,
        TableauUiListModule,
        TableauUiTreeModule,
        TableauUiMenuModule,
        TableauUiAutoCompleteModule,
        TableauUiDatePickerModule,
        TableauUiFormModule,
        TableauUiExpansionPanelModule,
        TableauUiArrowScrollModule,
        TableauUiTableModule
    ],
})
export class TableauUiAllModule {}
