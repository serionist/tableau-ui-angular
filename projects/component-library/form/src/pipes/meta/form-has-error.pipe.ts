import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Meta } from '../../models/abstract-control/meta/interfaces';

@Pipe({
    name: 'formHasError',
    standalone: false,
    pure: true,
})
export class FormHasErrorPipe implements PipeTransform {
    transform(meta: Meta | null | undefined, specificError?: string, requireTouched: boolean = true, log = false): boolean {
        const ret = meta?.hasError(specificError, requireTouched) ?? false;
        if (log) {
            console.log('hasFormError', meta, specificError, requireTouched, ret);
        }
        return ret;
    }
}
