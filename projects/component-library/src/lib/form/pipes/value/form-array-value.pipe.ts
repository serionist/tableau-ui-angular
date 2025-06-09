import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { FA } from '../../models/form-array/interaces';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { FG } from '../../models/form-group/interfaces';
import type { DeepPartial } from '../../types/deep-partial';

@Pipe({
    name: 'formArrayValue',
    standalone: false,
    pure: true,
})
export class FormArrayValuePipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform<TKind extends 'standard' | 'raw' = 'standard', TItem extends Record<string, any> = any>(
        formRef: FA<TItem> | null | undefined,
        kind?: TKind,
    ): Observable<TKind extends 'standard' ? DeepPartial<TItem[]> : TItem[]> {
        if (!formRef) {
            throw new Error('FormArrayValuePipe: formRef is null or undefined');
        }
        let ret;
        if (kind === 'standard') {
            ret = formRef.value$;
        } else {
            ret = formRef.rawValue$;
        }
        return ret as unknown as Observable<TKind extends 'standard' ? DeepPartial<TItem[]> : TItem[]>;
    }
}
