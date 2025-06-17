import type { TemplateRef, WritableSignal } from '@angular/core';
import type { ColumnDefDirective } from '../column-def/column-def.directive';
export interface CellContext<TData> {
    row: TData;
    meta: CellMetaContext<TData>;
    $isClamped: WritableSignal<boolean>;
    maxRowCount: number;
}
export interface CellMetaContext<TData> {
    columnDef: ColumnDefDirective<TData>;
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

export interface CellTooltipContext<TData> extends CellContext<TData> {
    cellTemplate: TemplateRef<{ $implicit: CellContext<TData> }>;
}
