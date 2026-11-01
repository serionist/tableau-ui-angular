import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

// What a row's selection checkbox says after "Select": the app's rowLabel for the row, or its place, "row 12", when
// there is none or it has no words
@Pipe({
  name: 'rowName',
  standalone: false,
})
export class RowNamePipe<TData> implements PipeTransform {
  transform(row: TData, rowLabel: ((row: TData) => string) | undefined, place: number): string {
    const label = rowLabel?.(row);
    return label !== undefined && label.trim() !== '' ? label : `row ${place}`;
  }
}
