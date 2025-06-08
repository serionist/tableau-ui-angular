import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { DataSort } from './data-sort';
@Pipe({
    name: 'sortInfoPipe',
    standalone: false,
})
export class SortInfoPipe implements PipeTransform {
    transform(sorts: DataSort[], colId: string, propertyName: string | undefined): { info: DataSort; index: number } | undefined {
        const p = propertyName ?? colId;
        const index = sorts.findIndex((e) => e.property === p);
        if (index === -1) {
            return undefined;
        }
        const info = sorts[index];
        return { info, index };
    }
}
