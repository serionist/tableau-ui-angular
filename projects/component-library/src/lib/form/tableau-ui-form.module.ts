import { NgModule } from '@angular/core';
import { FormArrayValuePipe } from './form-array-value.pipe';
import { FormControlPipe } from './form-control.pipe';
import { GetFormErrorPipe } from './form-get-error.pipe';
import { HasFormErrorPipe } from './form-has-error.pipe';
import { FormMetaPipe } from './form-meta.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControlValuePipe } from './form-control-value.pipe';
import { FormGroupValuePipe } from './form-group-value.pipe';

@NgModule({
    imports: [ReactiveFormsModule, CommonModule],
    declarations: [
        FormArrayValuePipe,
        FormControlPipe,
        GetFormErrorPipe,
        HasFormErrorPipe,
        FormMetaPipe,
        FormGroupValuePipe,
        FormControlValuePipe
    ],
    exports: [
        FormArrayValuePipe,
        FormControlPipe,
        GetFormErrorPipe,
        HasFormErrorPipe,
        FormMetaPipe,
        FormGroupValuePipe,
        FormControlValuePipe
    ],
})
export class TableauUiFormModule {}
