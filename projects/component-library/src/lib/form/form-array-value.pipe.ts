import { AbstractControl, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { Pipe } from '@angular/core';
import { FormHelper } from './form-helper';
import { IAbstractControlWithRef } from './public-api';

@Pipe({
    name: 'formArrayValue',
    standalone: false,
    pure: true
})
export class FormArrayValuePipe {
  transform<TControl extends AbstractControl<any> = any>(
    form: FormArray<TControl>
  ): Observable<TControl[]> {
    return FormHelper.getArrayValue$(form);
  }
}
