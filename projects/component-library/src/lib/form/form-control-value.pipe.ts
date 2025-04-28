import { AbstractControl, FormControl, isFormControl } from '@angular/forms';
import { map, Observable, of, switchMap } from 'rxjs';
import { Pipe } from '@angular/core';
import { AbstractControlMeta, FormHelper, Primitive } from './form-helper';

@Pipe({
    name: 'formControlValue',
    standalone: false,
    pure: true
})
export class FormControlValuePipe {
    /**
     * Transforms the value of a FormControl into an observable.
     * @param form The FormControl of a parent of the FormControl
     * @param path The path to the FormControl within the parent. Leave empty if the form is a FormControl itself.
     * @param fireInitial Whether to fire the initial value immediately.
     * @param onlyChangedValues Whether to only emit changed values.
     * 
     * @returns An observable of the form control's value.
     */
    transform<T extends Primitive>(
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
                e && isFormControl(e) ? FormHelper.getValue$(e, fireInitial, onlyChangedValues) : of(null)
            )
        );
    }
}
