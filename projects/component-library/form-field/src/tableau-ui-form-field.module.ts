import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from './form-field.component';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, ReactiveFormsModule],
    declarations: [FormFieldComponent],
    exports: [FormFieldComponent, ReactiveFormsModule, CommonModule],
})
export class TableauUiFormFieldModule {}
