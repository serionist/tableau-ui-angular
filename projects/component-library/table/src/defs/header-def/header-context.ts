import type { TemplateRef } from '@angular/core';
import type { DataSort } from '../../sorting/data-sort';
import type { ColumnDefDirective, SortOrderPair } from '../column-def/column-def.directive';
import type { Primitive } from 'tableau-ui-angular/types';

export interface HeaderContext<TData, TKey extends Primitive> {
    columnDef: ColumnDefDirective<TData, TKey>;
    meta: HeaderContextMeta;
}

export interface HeaderContextMeta {
    index: number;
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
    count: number;
}

export interface HeaderTooltipContext<TData, TKey extends Primitive> extends HeaderContext<TData, TKey> {
    headerTemplate?: TemplateRef<{ $implicit: HeaderContext<TData, TKey> }>;
    sortMode: 'multi' | 'single';
    sortable: boolean;
    sortOrder: SortOrderPair;
    currentSort: { info: DataSort; index: number } | undefined;
    allSorts: DataSort[];
}
