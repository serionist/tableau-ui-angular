import { NgModule } from '@angular/core';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';
import { CheckboxComponent } from './checkbox.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule],
    declarations: [CheckboxComponent],
    exports: [CheckboxComponent],
})
export class TableauUiCheckboxModule {}
