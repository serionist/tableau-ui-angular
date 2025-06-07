import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'isValueSelected',
    standalone: false,
    pure: true,
})
export class IsValueSelectedPipe implements PipeTransform {
    transform(selectedValue: any, optionValue: any, allowMultiple: boolean): boolean {
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
    safeStringify(obj: any) {
        const seen = new WeakSet();
        return JSON.stringify(obj, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) return '[Circular]';
                seen.add(value);
            }
            return value;
        });
    }
}
