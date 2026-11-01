import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

// What a row's selection checkbox says after "Select": the app's rowLabel for the row, or its place, "row 12", when
// there is none or it gives no words. Its type says string, but rows from a server can hand it null or a number, which
// must not throw while the table renders
@Pipe({
  name: 'rowName',
  standalone: false,
})
export class RowNamePipe<TData> implements PipeTransform {
  transform(row: TData, rowLabel: ((row: TData) => string) | undefined, place: number): string {
    const label: unknown = rowLabel?.(row);
    return typeof label === 'string' && label.trim() !== '' ? label : `row ${place}`;
  }
}
