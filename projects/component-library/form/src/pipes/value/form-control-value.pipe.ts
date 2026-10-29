import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { FC } from '../../models/form-control/interfaces';
import type { PrimitiveWithUndefined } from '../../models/form-control/types';

@Pipe({
  name: 'formControlValue',
  standalone: false,
  pure: true,
})
export class FormControlValuePipe implements PipeTransform {
  transform<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]>(group: FC<T> | null | undefined) {
    if (!group) {
      throw new Error('FormControlValuePipe: control is null or undefined');
    }
    return group.value$;
  }
}
