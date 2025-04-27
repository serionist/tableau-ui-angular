import { Pipe } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { AbstractControlMeta } from './form-helper';

@Pipe({
  name: 'formError',
  standalone: false,
  pure: true,
})
export class GetFormErrorPipe {
  transform(
    meta: AbstractControlMeta | null | undefined,
    specificError: string,
    requireTouched: boolean = true,
    log = false
  ): any | undefined {
    const ret = meta?.getErrorValue(specificError, requireTouched);
    if (log) {
      console.log('getFormError', meta, specificError, requireTouched, ret);
    }
    return ret;
  }
}
