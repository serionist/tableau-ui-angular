import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { SelectValue } from '../select.component';
import type { OptionComponent } from 'tableau-ui-angular/common';

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
