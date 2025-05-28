import { Pipe, PipeTransform } from '@angular/core';
import { ColumnDefDirective } from '../column-def/column-def.directive';
import { CellContext } from './cell-context';

@Pipe({
    name: 'cellContext',
    standalone: false,
})
export class CellContextPipe implements PipeTransform {
    transform<T>(
        value: T,
        def: ColumnDefDirective,
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
        columnCount: number
    ): CellContext<T> {
        return {
            $implicit: value,
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
        };
    }
}
