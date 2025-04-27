import { Pipe } from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { flatMap, map, Observable, of, switchMap } from 'rxjs';
import { FormHelper } from './form-helper';

@Pipe({
    name: 'formControl',
    standalone: false,
    pure: true
})
export class FormControlPipe {
    transform<T extends 'formControl' | 'formGroup' | 'formArray'>(
        form?: AbstractControl,
        path?: string,
        type?: T
    ): Observable<
        T extends 'formControl'
            ? FormControl | null
            : T extends 'formGroup'
            ? FormGroup | null
            : T extends 'formArray'
            ? FormArray | null
            : AbstractControl | null
    > {
        if (!form) {
            return of(null) as any;
        }
        const pathParts = path?.split('.').filter((p) => p !== '') ?? [];

        return FormHelper.getFormControl(form, pathParts).pipe(
            map((control) => {
                if (!control) {
                    return null;
                }
                if (type === 'formControl') {
                    if (control instanceof FormControl) {
                        return control;
                    }
                    return null;
                }
                if (type === 'formGroup') {
                    if (control instanceof FormGroup) {
                        return control;
                    }
                    return null;
                }
                if (type === 'formArray') {
                    if (control instanceof FormArray) {
                        return control;
                    }
                    return null;
                }
                return control;
            })
        ) as unknown as Observable<
            T extends 'formControl'
                ? FormControl | null
                : T extends 'formGroup'
                ? FormGroup | null
                : T extends 'formArray'
                ? FormArray | null
                : AbstractControl | null
        >;
    }

   
}
