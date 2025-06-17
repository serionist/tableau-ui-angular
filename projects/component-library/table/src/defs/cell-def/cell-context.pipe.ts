import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ColumnDefDirective } from '../column-def/column-def.directive';
import type { CellContext } from './cell-context';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
    name: 'cellContext',
    standalone: false,
})
export class CellContextPipe implements PipeTransform {
    transform<TData, TKey extends Primitive>(
        value: TData,
        maxRowCount: number,
        def: ColumnDefDirective<TData, TKey>,
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
    ): { $implicit: CellContext<TData, TKey> } {
        return {
            $implicit: def.buildCellContext(value, maxRowCount, index, first, last, even, odd, count, columnIndex, columnFirst, columnLast, columnEven, columnOdd, columnCount),
        };
    }
}
