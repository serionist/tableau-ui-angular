import { NgModule } from '@angular/core';
import { CheckboxComponent } from './checkbox.component';
import { CommonModule } from '@angular/common';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule],
    declarations: [CheckboxComponent],
    exports: [CheckboxComponent],
})
export class TableauUiCheckboxModule {}
