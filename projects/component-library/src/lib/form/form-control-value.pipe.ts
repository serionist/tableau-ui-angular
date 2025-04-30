import { AbstractControl, FormControl, isFormControl } from '@angular/forms';
import { map, Observable, of, switchMap } from 'rxjs';
import { Pipe } from '@angular/core';
import { Primitive } from './types/primitive';
import { FC } from './models/form-control.reference';

@Pipe({
    name: 'formControlValue',
    standalone: false,
    pure: true
})
export class FormControlValuePipe {
    /**
     * Transforms the value of a FormControl into an observable.
     * @param ctrl The FormControl reference (FC) instance to transform.
     * @param fireInitial Whether to fire the initial value immediately.
     * @param onlyChangedValues Whether to only emit changed values.
     * 
     * @returns An observable of the form control's value.
     */
    transform<T extends Primitive = any>(
        ctrl: FC<T> | undefined | null
    ): Observable<T | null> {
        if (!ctrl) {
            return of(null);
        }
        return ctrl.value$;
    }
}
