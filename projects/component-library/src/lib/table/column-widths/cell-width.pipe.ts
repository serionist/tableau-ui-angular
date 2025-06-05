import { Pipe, PipeTransform } from '@angular/core';
import { ColRenderedWidthDirective } from './col-rendered-width.directive';
import { debounceTime, map, Observable, of } from 'rxjs';

@Pipe({
  name: 'cellWidth',
  standalone: false
})
export class CellWidthPipe implements PipeTransform {

  transform(directives: readonly ColRenderedWidthDirective[], colId: string, element: HTMLElement): Observable<string> {
    const col = directives.find(d => d.columnId() === colId);
    if (!col) {
      return of('');
    }
    const style = getComputedStyle(element);
    //return of('10px');
    return col.renderedWidth.pipe(map(e => `calc(${e}px - ${style.paddingLeft} - ${style.paddingRight})`));
  }

}
