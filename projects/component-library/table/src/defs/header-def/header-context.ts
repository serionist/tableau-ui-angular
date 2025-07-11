import type { TemplateRef } from '@angular/core';
import type { DataSort } from '../../sorting/data-sort';
import type { ColumnDefDirective, SortOrderPair } from '../column-def/column-def.directive';

export interface HeaderContext<TData> {
  columnDef: ColumnDefDirective<TData>;
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

export interface HeaderTooltipContext<TData> extends HeaderContext<TData> {
  headerTemplate?: TemplateRef<{ $implicit: HeaderContext<TData> }>;
  sortMode: 'multi' | 'single';
  sortable: boolean;
  sortOrder: SortOrderPair;
  currentSort: { info: DataSort; index: number } | undefined;
  allSorts: DataSort[];
}
