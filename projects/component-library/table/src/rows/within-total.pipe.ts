import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

// A block's rows that fall within the total, once a load has said it: a block still loading, or failed, holds a
// placeholder for each row a block can hold, and the last block holds fewer rows, so a row's place never passes the
// row count. While the total is unknown, 0, every row
@Pipe({
  name: 'withinTotal',
  standalone: false,
})
export class WithinTotalPipe implements PipeTransform {
  transform<TRow>(rows: TRow[], offset: number, total: number): TRow[] {
    return total > 0 && offset + rows.length > total ? rows.slice(0, Math.max(0, total - offset)) : rows;
  }
}
