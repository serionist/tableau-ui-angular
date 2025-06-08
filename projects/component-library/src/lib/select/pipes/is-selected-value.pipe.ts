import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { OptionComponent } from '../../common/option';
import type { SelectValue } from '../select.component';

@Pipe({
    name: 'isSelectedValue',
    standalone: false,
})
export class IsSelectedValuePipe implements PipeTransform {
    transform(option: OptionComponent, allowMultiple: boolean, value: SelectValue): boolean {
        if (allowMultiple) {
            return value instanceof Array && value.includes(option.$value());
        }
        return option.$value() === value;
    }
}
