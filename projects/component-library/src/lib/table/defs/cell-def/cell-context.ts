import type { ColumnDefDirective } from '../column-def/column-def.directive';
export interface CellContext<T = unknown> {
    $implicit: T;
    columnDef: ColumnDefDirective;
    index: number;
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
    count: number;
    columnIndex: number;
    columnFirst: boolean;
    columnLast: boolean;
    columnEven: boolean;
    columnOdd: boolean;
    columnCount: number;
}
