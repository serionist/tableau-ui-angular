import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FB } from './models/fb';
import { FormErrorPipe } from './pipes/meta/form-error.pipe';
import { FormHasErrorPipe } from './pipes/meta/form-has-error.pipe';
import { FormArrayPipe } from './pipes/raw-controls/form-array.pipe';
import { FormMetaPipe } from './pipes/meta/form-meta.pipe';
import { FormControlPipe } from './pipes/raw-controls/form-control.pipe';
import { FormGroupPipe } from './pipes/raw-controls/form-group.pipe';
import { FormArrayValuePipe } from './pipes/value/form-array-value.pipe';
import { FormControlValuePipe } from './pipes/value/form-control-value.pipe';
import { FormGroupValuePipe } from './pipes/value/form-group-value.pipe';
import { FormArrayControlsPipe } from './pipes/form-array-controls.pipe';
@NgModule({
    declarations: [FormErrorPipe, FormHasErrorPipe, FormMetaPipe, FormArrayPipe, FormControlPipe, FormGroupPipe, FormArrayValuePipe, FormControlValuePipe, FormGroupValuePipe, FormArrayControlsPipe],
    imports: [ReactiveFormsModule, CommonModule],
    exports: [FormErrorPipe, FormHasErrorPipe, FormMetaPipe, FormArrayPipe, FormControlPipe, FormGroupPipe, FormArrayValuePipe, FormControlValuePipe, FormGroupValuePipe, FormArrayControlsPipe],
    providers: [FB],
})
export class TableauUiFormModule {}
