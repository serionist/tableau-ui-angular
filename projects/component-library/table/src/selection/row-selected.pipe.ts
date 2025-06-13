import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';
import type { DataOptions } from '../data/data-options';

@Pipe({
    name: 'rowSelected',
    standalone: false,
})
export class RowSelectedPipe<TData, TKey extends Primitive> implements PipeTransform {
    transform(row: TData, selectedRows: Map<TKey, TData>, dataOptions: DataOptions<TData, TKey>): boolean {
        const key = dataOptions.getRowKey(row);
        return selectedRows.has(key);
    }
}
