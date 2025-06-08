/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractControl, FormControl, isFormControl } from '@angular/forms';
import type { Observable } from 'rxjs';
import { map, of, switchMap } from 'rxjs';
import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Primitive } from '../common/types/primitive';
import type { FC } from './models/form-control.reference';

@Pipe({
    name: 'formControlValue',
    standalone: false,
    pure: true,
})
export class FormControlValuePipe implements PipeTransform {
    /**
     * Transforms the value of a FormControl into an observable.
     * @param ctrl The FormControl reference (FC) instance to transform.
     * @param fireInitial Whether to fire the initial value immediately.
     * @param onlyChangedValues Whether to only emit changed values.
     *
     * @returns An observable of the form control's value.
     */
    transform<T extends Primitive = any>(ctrl: FC<T> | null | undefined): Observable<T | null> {
        if (!ctrl) {
            return of(null);
        }
        return ctrl.value$;
    }
}
