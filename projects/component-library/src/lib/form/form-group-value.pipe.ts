import { AbstractControl, FormGroup } from '@angular/forms';
import { map, Observable, of, switchMap } from 'rxjs';
import { Pipe } from '@angular/core';
import { AbstractControlMeta, FormHelper } from './form-helper';
import { DeepPartial } from './public-api';

@Pipe({
    name: 'formGroupValue',
    standalone: false,
    pure: true
})
export class FormGroupValuePipe {
    transform<T extends Record<string, any>>(
        group: FormGroup<T> | null | undefined,
        fireInitial = true,
        onlyChangedValues = true
    ): Observable<DeepPartial<T> | null> {
        if (!group) {
            return of(null);
        }
        return FormHelper.getGroupValue$(group, fireInitial, onlyChangedValues);
    }
}
