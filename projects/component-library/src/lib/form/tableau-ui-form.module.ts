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
import { FormChildPipe } from './form-child.pipe';
import { FormControlRequiredPipe } from './form-control-required.pipe';
import { ControlReferenceBuilder } from './models/control-reference-builder';
@NgModule({
    imports: [ReactiveFormsModule, CommonModule],
    declarations: [
        FormArrayValuePipe,
        FormControlPipe,
        GetFormErrorPipe,
        HasFormErrorPipe,
        FormMetaPipe,
        FormGroupValuePipe,
        FormControlValuePipe,
        FormChildPipe,
        FormControlRequiredPipe
    ],
    exports: [
        FormArrayValuePipe,
        FormControlPipe,
        GetFormErrorPipe,
        HasFormErrorPipe,
        FormMetaPipe,
        FormGroupValuePipe,
        FormControlValuePipe,
        FormChildPipe,
        FormControlRequiredPipe
    ],
    providers: [ControlReferenceBuilder]
})
export class TableauUiFormModule {}
