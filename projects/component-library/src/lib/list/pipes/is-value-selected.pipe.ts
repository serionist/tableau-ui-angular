import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ListValue } from '../list.component';
import type { Primitive } from '../../common/types/primitive';

@Pipe({
    name: 'isValueSelected',
    standalone: false,
    pure: true,
})
export class IsValueSelectedPipe implements PipeTransform {
    transform(selectedValue: ListValue, optionValue: Exclude<Primitive, undefined>, allowMultiple: boolean): boolean {
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
