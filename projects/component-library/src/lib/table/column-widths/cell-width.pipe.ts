import { Pipe, PipeTransform } from '@angular/core';
import { ColRenderedWidthDirective } from './col-rendered-width.directive';
import { debounceTime, map, Observable, of } from 'rxjs';

@Pipe({
  name: 'cellWidth',
  standalone: false
})
export class CellWidthPipe implements PipeTransform {

  transform(directives: readonly ColRenderedWidthDirective[], colId: string, padding: string): Observable<string> {
    const col = directives.find(d => d.columnId() === colId);
    if (!col) {
      return of('');
    }
    const pad = this.parsePadding(padding);
    //return of('10px');
    return col.renderedWidth.pipe(map(e => `calc(${e}px - ${pad.left} - ${pad.right})`));
  }

  private parsePadding(padding: string): { top: string; right: string; bottom: string; left: string } {
    const parts = padding.trim().split(/\s+/);
  
    switch (parts.length) {
      case 1:
        return {
          top: parts[0],
          right: parts[0],
          bottom: parts[0],
          left: parts[0]
        };
      case 2:
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[0],
          left: parts[1]
        };
      case 3:
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[2],
          left: parts[1]
        };
      case 4:
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[2],
          left: parts[3]
        };
      default:
        throw new Error("Invalid padding value");
    }
  }
  

}
