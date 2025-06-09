import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { FG } from '../../models/form-group/interfaces';
import type { Observable } from 'rxjs';
import type { DeepPartial } from 'tableau-ui-angular/types';

@Pipe({
    name: 'formGroupValue',
    standalone: false,
    pure: true,
})
export class FormGroupValuePipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform<TKind extends 'standard' | 'raw' = 'standard', T extends Record<string, any> = any>(group: FG<T> | null | undefined, kind?: TKind): Observable<TKind extends 'standard' ? DeepPartial<T> : T> {
        if (!group) {
            throw new Error('FormGroupValuePipe: group is null or undefined');
        }
        let ret;
        if (kind === 'standard') {
            ret = group.value$;
        } else {
            ret = group.rawValue$;
        }
        return ret as unknown as Observable<TKind extends 'standard' ? DeepPartial<T> : T>;
    }
}
