import { CommonModule } from '@angular/common';
import { FormErrorPipe, FormHasErrorPipe, FormMetaPipe, FormArrayPipe, FormControlPipe, FormGroupPipe, FormArrayValuePipe, FormControlValuePipe, FormGroupValuePipe, FormArrayControlsPipe, FB } from 'tableau-ui-angular/form';

export function importFormPipes() {
    return [FormErrorPipe, FormHasErrorPipe, FormMetaPipe, FormArrayPipe, FormControlPipe, FormGroupPipe, FormArrayValuePipe, FormControlValuePipe, FormGroupValuePipe, FormArrayControlsPipe, CommonModule];
}
export function importFormBuilderProvider() {
    return [FB];
}