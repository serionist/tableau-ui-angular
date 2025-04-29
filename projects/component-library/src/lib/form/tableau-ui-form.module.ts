import { NgModule } from '@angular/core';
import { FormArrayControlsPipe } from './form-array-controls.pipe';
import { FormControlPipe } from './form-control.pipe';
import { GetFormErrorPipe } from './form-get-error.pipe';
import { HasFormErrorPipe } from './form-has-error.pipe';
import { FormMetaPipe } from './form-meta.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormComplexValuePipe } from './form-complex-value.pipe';
import { FormControlValuePipe } from './form-control-value.pipe';

@NgModule({
    imports: [ReactiveFormsModule, CommonModule],
    declarations: [
        FormArrayControlsPipe,
        FormControlPipe,
        GetFormErrorPipe,
        HasFormErrorPipe,
        FormMetaPipe,
        FormComplexValuePipe,
        FormControlValuePipe
    ],
    exports: [
        FormArrayControlsPipe,
        FormControlPipe,
        GetFormErrorPipe,
        HasFormErrorPipe,
        FormMetaPipe,
        FormComplexValuePipe,
        FormControlValuePipe
    ],
})
export class TableauUiFormModule {}
