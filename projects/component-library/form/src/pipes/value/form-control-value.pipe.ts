import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { FC } from '../../models/form-control/interfaces';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
    name: 'formControlValue',
    standalone: false,
    pure: true,
})
export class FormControlValuePipe implements PipeTransform {
    transform<T extends Primitive>(group: FC<T> | null | undefined) {
        if (!group) {
            throw new Error('FormControlValuePipe: control is null or undefined');
        }
        return group.value$;
    }
}
