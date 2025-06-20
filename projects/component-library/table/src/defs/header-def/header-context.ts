import type { TemplateRef } from '@angular/core';
import type { ColumnDefDirective, SortOrderPair } from '../column-def/column-def.directive';
import type { DataSort } from 'tableau-ui-angular/virtualize';

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
