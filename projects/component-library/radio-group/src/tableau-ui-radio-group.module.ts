import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { RadioGroupComponent } from './radio-group.component';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule],
    declarations: [RadioGroupComponent],
    exports: [RadioGroupComponent],
})
export class TableauUiRadioGroupModule {}
