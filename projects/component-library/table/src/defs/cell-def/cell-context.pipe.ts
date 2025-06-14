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
            $implicit: {
                row: value,
                meta: {
                    columnDef: def,
                    index: index,
                    first: first,
                    last: last,
                    even: even,
                    odd: odd,
                    count: count,
                    columnIndex: columnIndex,
                    columnFirst: columnFirst,
                    columnLast: columnLast,
                    columnEven: columnEven,
                    columnOdd: columnOdd,
                    columnCount: columnCount,
                },
            },
        };
    }
}
