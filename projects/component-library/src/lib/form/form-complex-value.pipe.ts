import { AbstractControl } from '@angular/forms';
import { map, Observable, of, switchMap } from 'rxjs';
import { Pipe } from '@angular/core';
import { AbstractControlMeta, FormHelper } from './form-helper';

@Pipe({
    name: 'formComplexValue',
    standalone: false,
    pure: true
})
export class FormComplexValuePipe {
    transform<T extends any>(
        form: AbstractControl<T> | undefined | null,
        path?: string,
        fireInitial = true,
        onlyChangedValues = true
    ): Observable<T | null> {
        if (!form) {
            return of(null);
        }
        const pathParts = path?.split('.').filter((p) => p !== '') ?? [];
        return FormHelper.getFormControl(form, pathParts).pipe(
            switchMap((e) =>
                e ? FormHelper.getComplexValue$(e, fireInitial, onlyChangedValues) : of(null)
            )
        );
    }
}
