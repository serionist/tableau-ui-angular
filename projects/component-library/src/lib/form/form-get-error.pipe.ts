import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { AbstractControlMeta } from './models/abstract-control.reference';

@Pipe({
  name: 'formError',
  standalone: false,
  pure: true,
})
export class GetFormErrorPipe implements PipeTransform{
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
