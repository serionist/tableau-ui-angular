import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ColumnDefDirective } from '../column-def/column-def.directive';
import type { CellContext } from './cell-context';

@Pipe({
    name: 'cellContext',
    standalone: false,
})
export class CellContextPipe implements PipeTransform {
    transform<TData>(
        value: TData,
        def: ColumnDefDirective<TData>,
        index: number,
        first: boolean,
        last: boolean,
        even: boolean,
        odd: boolean,
        count: number,
        columnIndex: number,
        columnFirst: boolean,
        columnLast: boolean,
        columnEven: boolean,
        columnOdd: boolean,
        columnCount: number,
    ): { $implicit: CellContext<TData> } {
        return {
            $implicit: def.buildCellContext(value, index, first, last, even, odd, count, columnIndex, columnFirst, columnLast, columnEven, columnOdd, columnCount)
        };
    }
}
