import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';
import type { DataOptions } from '../data/data-options';

@Pipe({
  name: 'rowSelected',
  standalone: false,
})
export class RowSelectedPipe<TData> implements PipeTransform {
  transform(row: TData, selectedRows: Map<Primitive, TData>, dataOptions: DataOptions<TData>): boolean {
    const key = dataOptions.getRowKey(row);
    return selectedRows.has(key);
  }
}
