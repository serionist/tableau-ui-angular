import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { OptionComponent } from 'tableau-ui-angular/common';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
  name: 'isSelectedValue',
  standalone: false,
})
export class IsSelectedValuePipe<T extends Primitive> implements PipeTransform {
  transform(option: OptionComponent<T>, allowMultiple: boolean, value: T | T[] | undefined): boolean {
    if (allowMultiple) {
      return value instanceof Array && value.includes(option.$value());
    }
    return option.$value() === value;
  }
}
