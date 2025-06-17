import type { TemplateRef } from '@angular/core';
import type { ColumnDefDirective } from '../column-def/column-def.directive';
import type { Primitive } from 'tableau-ui-angular/types';
export interface CellContext<TData, TKey extends Primitive> {
    row: TData;
    meta: CellMetaContext<TData, TKey>;
    maxRowCount: number;
}
export interface CellMetaContext<TData, TKey extends Primitive> {
    columnDef: ColumnDefDirective<TData, TKey>;
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

export interface CellTooltipContext<TData, TKey extends Primitive> extends CellContext<TData, TKey> {
    cellTemplate: TemplateRef<{ $implicit: CellContext<TData, TKey> }>;
    isRowCellClamped: boolean;
}
