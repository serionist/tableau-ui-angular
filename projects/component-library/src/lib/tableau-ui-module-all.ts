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
import { TableauUiListModule, TableauUiSelectModule } from '../public-api';

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
        TableauUiListModule
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
        TableauUiListModule
    ],
})
export class TableauUiAllModule {}
