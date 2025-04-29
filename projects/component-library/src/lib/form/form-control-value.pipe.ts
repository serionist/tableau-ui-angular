import { AbstractControl, FormControl, isFormControl } from '@angular/forms';
import { map, Observable, of, switchMap } from 'rxjs';
import { Pipe } from '@angular/core';
import { AbstractControlMeta, FormHelper } from './form-helper';
import { Primitive } from './types/primitive';

@Pipe({
    name: 'formControlValue',
    standalone: false,
    pure: true
})
export class FormControlValuePipe {
    /**
     * Transforms the value of a FormControl into an observable.
     * @param ctrl The FormControl
     * @param fireInitial Whether to fire the initial value immediately.
     * @param onlyChangedValues Whether to only emit changed values.
     * 
     * @returns An observable of the form control's value.
     */
    transform<T extends Primitive>(
        ctrl: FormControl<T> | undefined | null,
        fireInitial = true,
        onlyChangedValues = true
    ): Observable<T | null> {
        if (!ctrl) {
            return of(null);
        }
        return FormHelper.getValue$(ctrl, fireInitial, onlyChangedValues);
    }
}
