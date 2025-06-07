import { NgModule } from '@angular/core';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';
import { CheckboxComponent } from './checkbox.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [CheckboxComponent],
    imports: [CommonModule, TableauUiCommonModule],
    exports: [CheckboxComponent],
})
export class TableauUiCheckboxModule {}
