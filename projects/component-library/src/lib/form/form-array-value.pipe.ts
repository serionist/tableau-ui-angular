import { AbstractControl, FormArray } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { FA } from './models/form-array.reference';
import { FG } from './public-api';

@Pipe({
    name: 'formArrayValue',
    standalone: false,
    pure: true,
})
export class FormArrayValuePipe implements PipeTransform {
    transform<TItem extends Record<string, any> = any>(formRef: FA<TItem> | undefined | null): Observable<FG<TItem>[] | null> {
        if (!formRef) {
            return of(null);
        }
        return formRef.controls$;
    }
}
