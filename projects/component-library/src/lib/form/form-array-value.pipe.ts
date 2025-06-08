/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractControl, FormArray } from '@angular/forms';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { FA } from './models/form-array.reference';
import type { FG } from './public-api';

@Pipe({
    name: 'formArrayValue',
    standalone: false,
    pure: true,
})
export class FormArrayValuePipe implements PipeTransform {
    transform<TItem extends Record<string, any> = any>(formRef: FA<TItem> | null | undefined): Observable<FG<TItem>[] | null> {
        if (!formRef) {
            return of(null);
        }
        return formRef.controls$;
    }
}
