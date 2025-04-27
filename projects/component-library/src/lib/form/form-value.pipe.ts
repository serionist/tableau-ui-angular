import { AbstractControl } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { Pipe } from '@angular/core';
import { AbstractControlMeta, FormHelper } from './form-helper';

@Pipe({
    name: 'formValue',
    standalone: false,
    pure: true
})
export class FormValuePipe {
    transform(
        form: AbstractControl | undefined | null,
        path?: string,
        fireInitial = true,
        onlyChangedValues = true
    ): Observable<AbstractControlMeta | null> {
        if (!form) {
            return of(null);
        }
        const pathParts = path?.split('.').filter((p) => p !== '') ?? [];
        return FormHelper.getFormControl(form, pathParts).pipe(
            switchMap((e) =>
                e ? FormHelper.getValue$(e, fireInitial, onlyChangedValues) : of(null)
            )
        );
    }
}
