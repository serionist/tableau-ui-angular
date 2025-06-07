import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'colWidth',
    standalone: false,
})
export class ColWidthPipe implements PipeTransform {
    transform(value: string | number | undefined, mode: 'widthUnitsOnly' | 'flexGrowOnly' | 'width'): string {
        if (value === undefined || value === null) {
            return '';
        }
        let numberValue: number;
        if (typeof value === 'string') {
            const isNumber = /^(\d*(?:\.\d+)?)$/.exec(value.trim());
            if (!isNumber) {
                switch (mode) {
                    case 'widthUnitsOnly':
                    case 'width':
                        return value;
                    case 'flexGrowOnly':
                        return '';
                }
            } else {
                numberValue = parseFloat(isNumber[1]);
            }
        } else {
            numberValue = value;
        }
        switch (mode) {
            case 'widthUnitsOnly':
                return '';
            case 'flexGrowOnly':
                return value.toString();
            case 'width':
                return `${value}px`;
            default:
                return '';
        }
    }
}
