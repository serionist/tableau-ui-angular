import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';
import { RadiogroupComponent } from './radiogroup.component';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule],
    declarations: [RadiogroupComponent],
    exports: [RadiogroupComponent],
})
export class TableauUiRadioGroupModule {}
