import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { CellContext } from './cell-context';

@Pipe({
  name: 'showCellTooltip',
  standalone: false
})
export class ShowCellTooltipPipe implements PipeTransform {

  transform<TData>(showTooltip: boolean | ((ctx: CellContext<TData>) => boolean), context: CellContext<TData>): boolean {

    if (typeof showTooltip === 'function') {
      return showTooltip(context);
    } else {
      return showTooltip;
    }
  }

}
