import { AbstractControl, FormGroup } from '@angular/forms';
import { map, Observable, of, switchMap } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { DeepPartial } from './public-api';
import { FG } from './models/form-group.reference';

@Pipe({
    name: 'formGroupValue',
    standalone: false,
    pure: true,
})
export class FormGroupValuePipe implements PipeTransform {
    transform<T extends Record<string, any> = any>(group: FG | null | undefined): Observable<DeepPartial<T> | null> {
        if (!group) {
            return of(null);
        }
        return group.value$;
    }
}
