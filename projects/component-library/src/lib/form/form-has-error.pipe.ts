import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { AbstractControlMeta } from './models/abstract-control.reference';

@Pipe({
  name: 'formHasError',
  standalone: false,
  pure: true,
})
export class HasFormErrorPipe implements PipeTransform {
  transform(
    meta: AbstractControlMeta | null | undefined,
    specificError?: string,
    requireTouched: boolean = true,
    log = false
  ): boolean {
    const ret = meta?.hasError(specificError, requireTouched) ?? false;
    if (log) {
      console.log('hasFormError', meta, specificError, requireTouched, ret);
    }
    return ret;
  }
}
