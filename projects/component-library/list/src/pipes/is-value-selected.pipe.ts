import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
  name: 'isValueSelected',
  standalone: false,
  pure: true,
})
export class IsValueSelectedPipe<T extends Primitive> implements PipeTransform {
  transform(selectedValue: T | T[] | undefined, optionValue: T, allowMultiple: boolean): boolean {
    if (allowMultiple && Array.isArray(selectedValue)) {
      return selectedValue.includes(optionValue);
    } else {
      return (
        selectedValue === optionValue
        // ||
        // this.safeStringify(selectedValue) ===
        //     this.safeStringify(optionValue)
      );
    }
  }
}
