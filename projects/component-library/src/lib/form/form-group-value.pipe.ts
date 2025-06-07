import { AbstractControl, FormGroup } from '@angular/forms';
import type { Observable} from 'rxjs';
import { map, of, switchMap } from 'rxjs';
import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { DeepPartial } from './public-api';
import type { FG } from './models/form-group.reference';

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
