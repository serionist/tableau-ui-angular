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
    pure: true,
})
export class FormControlPipe {
    transform<T extends 'control' | 'group' | 'array' | 'abstract' = 'control'>(
        form: AbstractControl | undefined | null,
        path?: string | undefined,
        type?: T
    ): Observable<
        T extends 'control'
            ? FormControl | null
            : T extends 'group'
            ? FormGroup | null
            : T extends 'array'
            ? FormArray | null
            : T extends 'abstract'
            ? AbstractControl | null
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
                if (type === 'control') {
                    if (control instanceof FormControl) {
                        return control;
                    }
                    return null;
                }
                if (type === 'group') {
                    if (control instanceof FormGroup) {
                        return control;
                    }
                    return null;
                }
                if (type === 'array') {
                    if (control instanceof FormArray) {
                        return control;
                    }
                    return null;
                }
                return control;
            })
        ) as unknown as Observable<
            T extends 'control'
                ? FormControl | null
                : T extends 'group'
                ? FormGroup | null
                : T extends 'array'
                ? FormArray | null
                : T extends 'abstract'
                ? AbstractControl | null
                : AbstractControl | null
        >;
    }
}
