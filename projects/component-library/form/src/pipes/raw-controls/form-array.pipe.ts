import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { AC } from '../../models/abstract-control/interfaces';
import type { FormArray } from '@angular/forms';
import type { FAImpl } from '../../models/form-array/impl';

@Pipe({
  name: 'formArray',
  standalone: false,
})
export class FormArrayPipe implements PipeTransform {
  transform(form: AC, path?: string): FormArray {
    const ret = form.hierarchy.getChild(path);
    if (!ret) {
      throw new Error(`formArray: No child found at path "${path}"`);
    }
    if (ret.type !== 'array') {
      throw new Error(`formArray: Expected a FormArray at path "${path}", but got "${ret.type}"`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ret as FAImpl<any>).control as FormArray;
  }
}
