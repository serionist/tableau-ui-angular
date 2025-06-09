import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Meta } from '../../models/abstract-control/meta/interfaces';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
    name: 'formError',
    standalone: true,
    pure: true,
})
export class FormErrorPipe implements PipeTransform {
    transform(meta: Meta | null | undefined, specificError: string, requireTouched: boolean = true, log = false): Primitive {
        const ret = meta?.getErrorValue(specificError, requireTouched);
        if (log) {
            console.log('getFormError', meta, specificError, requireTouched, ret);
        }
        return ret;
    }
}
