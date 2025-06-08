/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import type { AbstractControlMeta } from './models/abstract-control.reference';

@Pipe({
    name: 'formError',
    standalone: false,
    pure: true,
})
export class GetFormErrorPipe implements PipeTransform {
    transform(meta: AbstractControlMeta | null | undefined, specificError: string, requireTouched: boolean = true, log = false): any | undefined {
        const ret = meta?.getErrorValue(specificError, requireTouched);
        if (log) {
            console.log('getFormError', meta, specificError, requireTouched, ret);
        }
        return ret;
    }
}
