// The public API of tableau-ui-angular/table, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i20 from '@angular/common';
import * as i0 from '@angular/core';
import { InputSignal, ModelSignal, OnDestroy, PipeTransform, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import * as i22 from 'tableau-ui-angular/button';
import * as i24 from 'tableau-ui-angular/checkbox';
import * as i21 from 'tableau-ui-angular/icon';
import * as i23 from 'tableau-ui-angular/tooltip';
import { TooltipArgs } from 'tableau-ui-angular/tooltip';
import { Primitive } from 'tableau-ui-angular/types';
import { DataBlock, DataOptions, DataRowCss, DataSort, VirtualizeBaseComponent } from 'tableau-ui-angular/virtualize';

declare class CellClassPipe implements PipeTransform {
  transform<TData>(ctx: CellContext<TData>): string | undefined;
  static ɵfac: i0.ɵɵFactoryDeclaration<CellClassPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<CellClassPipe, 'cellClass', false>;
}

interface CellContext<TData> {
  row: TData;
  meta: CellMetaContext<TData>;
  maxRowCount: number;
}

declare class CellContextPipe implements PipeTransform {
  transform<TData>(
    value: TData,
    maxRowCount: number,
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
  ): {
    $implicit: CellContext<TData>;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<CellContextPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<CellContextPipe, 'cellContext', false>;
}

export declare class CellDefDirective<TData> {
  readonly table: import('@angular/core').InputSignal<TableComponent<TData>>;
  readonly $textClamping: import('@angular/core').InputSignal<boolean>;
  templateRef: TemplateRef<{
    $implicit: CellContext<TData>;
  }>;
  static ngTemplateContextGuard<TData>(
    dir: CellDefDirective<TData>,
    ctx: unknown,
  ): ctx is {
    $implicit: CellContext<TData>;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<CellDefDirective<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CellDefDirective<any>,
    '[tabCellDef]',
    never,
    {
      table: {
        alias: 'tabCellDef';
        required: true;
        isSignal: true;
      };
      $textClamping: {
        alias: 'textClamping';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    never,
    false,
    never
  >;
}

interface CellMetaContext<TData> {
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

export declare class CellToolipDefDirective<TData> {
  readonly table: import('@angular/core').InputSignal<TableComponent<TData>>;
  readonly $showTooltip: import('@angular/core').InputSignal<boolean | ((ctx: CellContext<TData>, isClamped: boolean) => boolean)>;
  readonly $tooltipPosition: import('@angular/core').InputSignal<'bottom' | 'left' | 'right' | 'top'>;
  readonly $tooltipMargin: import('@angular/core').InputSignal<string>;
  readonly templateRef: TemplateRef<any>;
  static ngTemplateContextGuard<TData>(
    dir: CellToolipDefDirective<TData>,
    ctx: unknown,
  ): ctx is {
    $implicit: CellTooltipContext<TData>;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<CellToolipDefDirective<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CellToolipDefDirective<any>,
    '[tabCellTooltipDef]',
    never,
    {
      table: {
        alias: 'tabCellTooltipDef';
        required: true;
        isSignal: true;
      };
      $showTooltip: {
        alias: 'showTooltip';
        required: false;
        isSignal: true;
      };
      $tooltipPosition: {
        alias: 'tooltipPosition';
        required: false;
        isSignal: true;
      };
      $tooltipMargin: {
        alias: 'tooltipMargin';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    never,
    false,
    never
  >;
}

export interface CellTooltipArgs<TData> {
  ctx: CellContext<TData>;
  template: TemplateRef<CellContext<TData>>;
}

interface CellTooltipContext<TData> extends CellContext<TData> {
  cellTemplate: TemplateRef<{
    $implicit: CellContext<TData>;
  }>;
  isRowCellClamped: boolean;
}

declare class CellTooltipPipe implements PipeTransform {
  transform<TData>(
    cellElement: HTMLDivElement,
    columnDef: ColumnDefDirective<TData>,
    cellContext: CellContext<TData>,
    block: DataBlock<TData>,
  ): () => TooltipArgs<{
    $implicit: CellTooltipContext<TData>;
  }>;
  isClamped(cellElement: HTMLDivElement): boolean;
  static ɵfac: i0.ɵɵFactoryDeclaration<CellTooltipPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<CellTooltipPipe, 'cellTooltip', false>;
}

declare class CellWidthPipe implements PipeTransform {
  transform(directives: readonly ColRenderedWidthDirective[], colId: string, padding: string): Observable<string>;
  static ɵfac: i0.ɵɵFactoryDeclaration<CellWidthPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<CellWidthPipe, 'cellWidth', false>;
}

declare class ColRenderedWidthDirective implements OnDestroy {
  readonly columnId: import('@angular/core').InputSignal<string>;
  get renderedWidth(): Observable<number>;
  get isObserving(): boolean;
  constructor();
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ColRenderedWidthDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ColRenderedWidthDirective,
    '[colRenderedWidth]',
    never,
    {
      columnId: {
        alias: 'colRenderedWidth';
        required: true;
        isSignal: true;
      };
    },
    {},
    never,
    never,
    false,
    never
  >;
}

declare class ColWidthPipe implements PipeTransform {
  transform(value: number | string | undefined, mode: 'flexGrowOnly' | 'width' | 'widthUnitsOnly'): string;
  static ɵfac: i0.ɵɵFactoryDeclaration<ColWidthPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<ColWidthPipe, 'colWidth', false>;
}

export declare class ColumnDefDirective<TData> {
  readonly $id: InputSignal<string>;
  readonly $propertyName: InputSignal<string | undefined>;
  readonly $width: InputSignal<string | number>;
  readonly $minWidth: InputSignal<string>;
  readonly $maxWidth: InputSignal<string | undefined>;
  readonly $resizable: InputSignal<boolean>;
  readonly $sortable: InputSignal<boolean>;
  readonly $sortOrder: InputSignal<SortOrderPair>;
  readonly $headerClass: InputSignal<string | ((ctx: HeaderContext<TData>) => string | undefined) | undefined>;
  readonly $cellClass: InputSignal<string | ((ctx: CellContext<TData>) => string | undefined) | undefined>;
  readonly $showAutoHeaderTooltip: InputSignal<boolean>;
  readonly $showAutoCellTooltip: InputSignal<boolean>;
  readonly $cell: import('@angular/core').Signal<CellDefDirective<TData>>;
  readonly $header: import('@angular/core').Signal<HeaderDefDirective<TData> | undefined>;
  readonly $headerTooltip: import('@angular/core').Signal<HeaderToolipDefDirective<TData> | undefined>;
  readonly $cellTooltip: import('@angular/core').Signal<CellToolipDefDirective<TData> | undefined>;
  buildHeaderContext(index: number, first: boolean, last: boolean, even: boolean, odd: boolean, count: number): HeaderContext<TData>;
  buildCellContext(
    value: TData,
    maxRowCount: number,
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
  ): CellContext<TData>;
  static ɵfac: i0.ɵɵFactoryDeclaration<ColumnDefDirective<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ColumnDefDirective<any>,
    '[tabColumnDef]',
    never,
    {
      $id: {
        alias: 'tabColumnDef';
        required: true;
        isSignal: true;
      };
      $propertyName: {
        alias: 'propertyName';
        required: false;
        isSignal: true;
      };
      $width: {
        alias: 'width';
        required: false;
        isSignal: true;
      };
      $minWidth: {
        alias: 'minWidth';
        required: false;
        isSignal: true;
      };
      $maxWidth: {
        alias: 'maxWidth';
        required: false;
        isSignal: true;
      };
      $resizable: {
        alias: 'resizable';
        required: false;
        isSignal: true;
      };
      $sortable: {
        alias: 'sortable';
        required: false;
        isSignal: true;
      };
      $sortOrder: {
        alias: 'sortOrder';
        required: false;
        isSignal: true;
      };
      $headerClass: {
        alias: 'headerClass';
        required: false;
        isSignal: true;
      };
      $cellClass: {
        alias: 'cellClass';
        required: false;
        isSignal: true;
      };
      $showAutoHeaderTooltip: {
        alias: 'showAutoHeaderTooltip';
        required: false;
        isSignal: true;
      };
      $showAutoCellTooltip: {
        alias: 'showAutoCellTooltip';
        required: false;
        isSignal: true;
      };
    },
    {},
    ['$cell', '$header', '$headerTooltip', '$cellTooltip'],
    never,
    false,
    never
  >;
}

declare class CommonSelectionOptions {
  readonly selectionMode: 'checkbox' | 'row-and-checkbox';
  readonly clearSelectedKeysOnManualReset: boolean;
  readonly clearSelectedKeysOnAnyReset: boolean;
  constructor(selectionMode?: 'checkbox' | 'row-and-checkbox', clearSelectedKeysOnManualReset?: boolean, clearSelectedKeysOnAnyReset?: boolean);
}

declare class HeaderCheckboxModePipe implements PipeTransform {
  transform(selectionOptions: SelectionOptions | undefined): 'none' | 'selectNone' | 'selectAll' | undefined;
  static ɵfac: i0.ɵɵFactoryDeclaration<HeaderCheckboxModePipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<HeaderCheckboxModePipe, 'headerCheckboxMode', false>;
}

declare class HeaderClassPipe implements PipeTransform {
  transform<TData>(ctx: HeaderContext<TData>): string | undefined;
  static ɵfac: i0.ɵɵFactoryDeclaration<HeaderClassPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<HeaderClassPipe, 'headerClass', false>;
}

interface HeaderContext<TData> {
  columnDef: ColumnDefDirective<TData>;
  meta: HeaderContextMeta;
}

interface HeaderContextMeta {
  index: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
  count: number;
}

declare class HeaderContextPipe implements PipeTransform {
  transform<TData>(
    value: ColumnDefDirective<TData>,
    index: number,
    first: boolean,
    last: boolean,
    even: boolean,
    odd: boolean,
    count: number,
  ): {
    $implicit: HeaderContext<TData>;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<HeaderContextPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<HeaderContextPipe, 'headerContext', false>;
}

export declare class HeaderDefDirective<TData> {
  readonly table: import('@angular/core').InputSignal<TableComponent<TData>>;
  templateRef: TemplateRef<{
    $implicit: HeaderContext<TData>;
  }>;
  static ngTemplateContextGuard<TData>(
    dir: HeaderDefDirective<TData>,
    ctx: unknown,
  ): ctx is {
    $implicit: HeaderContext<TData>;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<HeaderDefDirective<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HeaderDefDirective<any>,
    '[tabHeaderDef]',
    never,
    {
      table: {
        alias: 'tabHeaderDef';
        required: true;
        isSignal: true;
      };
    },
    {},
    never,
    never,
    false,
    never
  >;
}

export declare class HeaderToolipDefDirective<TData> {
  readonly table: import('@angular/core').InputSignal<TableComponent<TData>>;
  readonly $showTooltip: import('@angular/core').InputSignal<boolean | ((ctx: HeaderContext<TData>) => boolean)>;
  readonly $tooltipPosition: import('@angular/core').InputSignal<'bottom' | 'left' | 'right' | 'top'>;
  readonly $tooltipMargin: import('@angular/core').InputSignal<string>;
  templateRef: TemplateRef<any>;
  static ngTemplateContextGuard<TData>(
    dir: HeaderToolipDefDirective<TData>,
    ctx: unknown,
  ): ctx is {
    $implicit: HeaderTooltipContext<TData>;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<HeaderToolipDefDirective<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HeaderToolipDefDirective<any>,
    '[tabHeaderTooltipDef]',
    never,
    {
      table: {
        alias: 'tabHeaderTooltipDef';
        required: true;
        isSignal: true;
      };
      $showTooltip: {
        alias: 'showTooltip';
        required: false;
        isSignal: true;
      };
      $tooltipPosition: {
        alias: 'tooltipPosition';
        required: false;
        isSignal: true;
      };
      $tooltipMargin: {
        alias: 'tooltipMargin';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    never,
    false,
    never
  >;
}

export interface HeaderTooltipArgs<TData> {
  ctx: HeaderContext<TData>;
  template: TemplateRef<HeaderContext<TData>>;
  sortMode: 'multi' | 'single';
  sortable: boolean;
  sortOrder: SortOrderPair;
  currentSort:
    | {
        info: DataSort;
        index: number;
      }
    | undefined;
  allSorts: DataSort[];
}

interface HeaderTooltipContext<TData> extends HeaderContext<TData> {
  headerTemplate?: TemplateRef<{
    $implicit: HeaderContext<TData>;
  }>;
  sortMode: 'multi' | 'single';
  sortable: boolean;
  sortOrder: SortOrderPair;
  currentSort:
    | {
        info: DataSort;
        index: number;
      }
    | undefined;
  allSorts: DataSort[];
}

declare class HeaderTooltipPipe implements PipeTransform {
  transform<TData>(
    columnDef: ColumnDefDirective<TData>,
    table: TableComponent<TData>,
    headerContext: HeaderContext<TData>,
    autoHeaderTooltipTemplate: TemplateRef<{
      $implicit: HeaderTooltipContext<TData>;
    }>,
    contextParams: {
      sortMode: 'multi' | 'single';
      sortable: boolean;
      sortOrder: SortOrderPair;
      currentSort:
        | {
            info: DataSort;
            index: number;
          }
        | undefined;
      allSorts: DataSort[];
    },
  ): () => TooltipArgs<{
    $implicit: HeaderTooltipContext<TData>;
  }>;
  static ɵfac: i0.ɵɵFactoryDeclaration<HeaderTooltipPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<HeaderTooltipPipe, 'headerTooltip', false>;
}

export declare class MultiSelectionOptions extends CommonSelectionOptions {
  readonly headerCheckboxMode: 'none' | 'selectNone' | 'selectAll';
  constructor(
    headerCheckboxMode: 'none' | 'selectNone' | 'selectAll',
    selectionMode?: 'checkbox' | 'row-and-checkbox',
    clearSelectedKeysOnManualReset?: boolean,
    clearSelectedKeysOnAnyReset?: boolean,
  );
}

declare class ResizerDirective {
  readonly $columnElement: import('@angular/core').InputSignal<HTMLElement>;
  readonly $enabled: import('@angular/core').InputSignal<boolean>;
  onMouseDown(event: MouseEvent): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ResizerDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ResizerDirective,
    '[resizerFor]',
    never,
    {
      $columnElement: {
        alias: 'resizerFor';
        required: true;
        isSignal: true;
      };
      $enabled: {
        alias: 'enabled';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    never,
    false,
    never
  >;
}

declare class RowSelectedPipe<TData> implements PipeTransform {
  transform(row: TData, selectedRows: Map<Primitive, TData>, dataOptions: DataOptions<TData>): boolean;
  static ɵfac: i0.ɵɵFactoryDeclaration<RowSelectedPipe<any>, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<RowSelectedPipe<any>, 'rowSelected', false>;
}

export type SelectionOptions = SingleSelectionOptions | MultiSelectionOptions;

export declare class SingleSelectionOptions extends CommonSelectionOptions {
  constructor(selectionMode?: 'checkbox' | 'row-and-checkbox', clearSelectedRowsOnManualReset?: boolean, clearSelectedRowsOnAnyReset?: boolean);
}

export declare class SortInfoPipe implements PipeTransform {
  transform(
    sorts: DataSort[],
    colId: string,
    propertyName: string | undefined,
  ):
    | {
        info: DataSort;
        index: number;
      }
    | undefined;
  static getSortInfo(
    sorts: DataSort[],
    colId: string,
    propertyName: string | undefined,
  ):
    | {
        info: DataSort;
        index: number;
      }
    | undefined;
  static ɵfac: i0.ɵɵFactoryDeclaration<SortInfoPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<SortInfoPipe, 'sortInfo', false>;
}

export type SortOrderPair = ['asc', 'desc'] | ['desc', 'asc'];

export declare class TableComponent<TData> extends VirtualizeBaseComponent<TData> {
  readonly self: this;
  constructor();
  readonly $displayedColumns: ModelSignal<string[] | undefined>;
  readonly $dataOptions: InputSignal<DataOptions<TData>>;
  readonly $dataBlockWindow: InputSignal<number>;
  readonly $dataRowCss: InputSignal<DataRowCss>;
  readonly $headerPadding: InputSignal<string>;
  readonly $sortMode: InputSignal<'multi' | 'single'>;
  readonly $sort: ModelSignal<DataSort[]>;
  readonly $pinnedLeftColumn: ModelSignal<string | undefined>;
  readonly $pinnedRightColumn: ModelSignal<string | undefined>;
  readonly $striped: ModelSignal<boolean>;
  readonly $noDataTemplate: InputSignal<string | TemplateRef<unknown>>;
  readonly $selectionOptions: InputSignal<SelectionOptions | undefined>;
  readonly $selectedRows: ModelSignal<Map<Primitive, TData>>;
  readonly $label: InputSignal<string | undefined>;
  readonly $columnDefs: import('@angular/core').Signal<readonly ColumnDefDirective<TData>[]>;
  selectionMultiHeaderCheckboxSelectNoneChanged(): void;
  selectionMultiHeaderCheckboxSelectAllChanged(val: boolean | 'partial'): Promise<void>;
  static ɵfac: i0.ɵɵFactoryDeclaration<TableComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TableComponent<any>,
    'tab-table',
    never,
    {
      $displayedColumns: {
        alias: 'displayedColumns';
        required: false;
        isSignal: true;
      };
      $dataOptions: {
        alias: 'dataOptions';
        required: true;
        isSignal: true;
      };
      $dataBlockWindow: {
        alias: 'dataBlockWindow';
        required: false;
        isSignal: true;
      };
      $dataRowCss: {
        alias: 'dataRowCss';
        required: false;
        isSignal: true;
      };
      $headerPadding: {
        alias: 'headerPadding';
        required: false;
        isSignal: true;
      };
      $sortMode: {
        alias: 'sortMode';
        required: false;
        isSignal: true;
      };
      $sort: {
        alias: 'sort';
        required: false;
        isSignal: true;
      };
      $pinnedLeftColumn: {
        alias: 'pinnedLeftColumn';
        required: false;
        isSignal: true;
      };
      $pinnedRightColumn: {
        alias: 'pinnedRightColumn';
        required: false;
        isSignal: true;
      };
      $striped: {
        alias: 'striped';
        required: false;
        isSignal: true;
      };
      $noDataTemplate: {
        alias: 'noDataTemplate';
        required: false;
        isSignal: true;
      };
      $selectionOptions: {
        alias: 'selectionOptions';
        required: false;
        isSignal: true;
      };
      $selectedRows: {
        alias: 'selectedRows';
        required: false;
        isSignal: true;
      };
      $label: {
        alias: 'label';
        required: false;
        isSignal: true;
      };
    },
    {
      $displayedColumns: 'displayedColumnsChange';
      $sort: 'sortChange';
      $pinnedLeftColumn: 'pinnedLeftColumnChange';
      $pinnedRightColumn: 'pinnedRightColumnChange';
      $striped: 'stripedChange';
      $selectedRows: 'selectedRowsChange';
    },
    ['$columnDefs'],
    never,
    false,
    never
  >;
}

export declare class TableauUiTableModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiTableModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiTableModule,
    [
      typeof TableComponent,
      typeof HeaderDefDirective,
      typeof HeaderToolipDefDirective,
      typeof HeaderTooltipPipe,
      typeof HeaderContextPipe,
      typeof HeaderClassPipe,
      typeof ColumnDefDirective,
      typeof CellDefDirective,
      typeof CellContextPipe,
      typeof CellClassPipe,
      typeof CellToolipDefDirective,
      typeof CellTooltipPipe,
      typeof SortInfoPipe,
      typeof ColWidthPipe,
      typeof ColRenderedWidthDirective,
      typeof CellWidthPipe,
      typeof ResizerDirective,
      typeof HeaderCheckboxModePipe,
      typeof RowSelectedPipe,
    ],
    [typeof i20.CommonModule, typeof i21.TableauUiIconModule, typeof i22.TableauUiButtonModule, typeof i23.TableauUiTooltipModule, typeof i24.TableauUiCheckboxModule],
    [typeof TableComponent, typeof HeaderDefDirective, typeof HeaderToolipDefDirective, typeof ColumnDefDirective, typeof CellDefDirective, typeof CellToolipDefDirective, typeof SortInfoPipe]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiTableModule>;
}

export type { CellContext, CellMetaContext, CellTooltipContext, HeaderContext, HeaderContextMeta, HeaderTooltipContext };
