import { AbstractControl, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { Pipe } from '@angular/core';
import { FormHelper } from './form-helper';
import { IAbstractControlWithRef } from './public-api';

@Pipe({
    name: 'formArrayControls',
    standalone: false,
    pure: true
})
export class FormArrayControlsPipe {
  transform<TControl extends AbstractControl<any> = any>(
    form: FormArray<TControl>
  ): Observable<TControl[]> {
    return FormHelper.arrayControls$(form);
  }
}
