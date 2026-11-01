// The public API of tableau-ui-angular/virtualize, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i6 from '@angular/common';
import * as i0 from '@angular/core';
import { ChangeDetectorRef, InputSignal, Signal, TemplateRef, WritableSignal } from '@angular/core';
import { Primitive } from 'tableau-ui-angular/types';

export declare class AllDataInfo<TData> {
  readonly promise: Promise<
    {
      key: Primitive;
      data: TData;
    }[]
  >;
  readonly abort: AbortController;
  get $allKeys(): Signal<Set<Primitive>>;
  get $status(): Signal<'canceled' | 'error' | 'loading' | 'success'>;
  constructor(
    promise: Promise<
      {
        key: Primitive;
        data: TData;
      }[]
    >,
    abort: AbortController,
  );
}

declare class BaseDataOptions<TData> {
  readonly getRowKey: (row: TData) => Primitive;
  constructor(getRowKey: (row: TData) => Primitive);
}

export interface BlocksInfo<TData> {
  prePixels: number;
  blocks: DataBlock<TData>[];
  postPixels: number;
}

export declare class CustomLoaderDirective {
  templateRef: TemplateRef<unknown>;
  static ɵfac: i0.ɵɵFactoryDeclaration<CustomLoaderDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<CustomLoaderDirective, '[tabCustomLoader]', never, {}, {}, never, never, false, never>;
}

export declare class DataBlock<TData> {
  readonly id: number;
  readonly abort: AbortController | undefined;
  readonly dataPromise: Promise<
    {
      key: Primitive;
      data: TData;
    }[]
  >;
  get $status(): Signal<DataBlockStatus>;
  readonly $data: Signal<
    {
      key: Primitive;
      data: TData;
    }[]
  >;
  get offset(): number;
  constructor(
    id: number,
    abort: AbortController | undefined,
    blockRowCount: number,
    getKey: (data: TData) => Primitive,
    dataPromise: Promise<
      {
        key: Primitive;
        data: TData;
      }[]
    >,
  );
}

export type DataBlockStatus = 'canceled' | 'error' | 'loading' | 'success';

export declare class DataManager<TData> {
  constructor(cdr: ChangeDetectorRef);
  get totalRowCount(): number;
  get $blocks(): Signal<BlocksInfo<TData>>;
  get $allDataInfo(): Signal<AllDataInfo<TData> | undefined>;
  get allDataInfo(): AllDataInfo<TData> | undefined;
  reset(dataWindowHeightPx: number, dataRowHeightPx: number, sort: DataSort[], dataBlockWindow: number, dataOptions: DataOptions<TData>): Promise<void>;
  destroy(): void;
  setScrollPosition(topPx: number): void;
}

export type DataOptions<TData> = IncrementalDataOptions<TData> | FullDataOptions<TData>;

export type DataRowCss = Partial<Record<keyof CSSStyleDeclaration, string>> & {
  height: NumericUnit;
  lineHeight: string;
  padding: PaddingValue;
};

type DataRowStyle = Pick<CSSStyleDeclaration, (typeof ROW_STYLE_PROPERTIES)[number]>;

interface DataSort {
  property: string;
  direction: 'asc' | 'desc';
}

export declare class ErrorTemplateDirective {
  templateRef: TemplateRef<{
    $implicit: ItemMetaContext;
  }>;
  static ngTemplateContextGuard(
    dir: ItemMetaContext,
    ctx: unknown,
  ): ctx is {
    $implicit: ItemMetaContext;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<ErrorTemplateDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<ErrorTemplateDirective, '[tabItemErrorTemplate]', never, {}, {}, never, never, false, never>;
}

export declare class FullDataOptions<TData> extends BaseDataOptions<TData> {
  readonly getAllData: (req: FullDataRequest) => Promise<FullDataResponse<TData>>;
  constructor(getRowKey: (row: TData) => Primitive, getAllData: (req: FullDataRequest) => Promise<FullDataResponse<TData>>);
}

interface FullDataRequest {
  readonly sort: readonly DataSort[];
  readonly abort: AbortSignal;
}

interface FullDataResponse<TData> {
  readonly data: TData[];
}

export declare class IncrementalDataOptions<TData> extends BaseDataOptions<TData> {
  readonly getDataBlock: (req: IncrementalDataRequest) => Promise<IncrementalDataResponse<TData>>;
  constructor(getRowKey: (row: TData) => Primitive, getDataBlock: (req: IncrementalDataRequest) => Promise<IncrementalDataResponse<TData>>);
}

interface IncrementalDataRequest extends FullDataRequest {
  readonly offset: number;
  readonly count: number;
}

interface IncrementalDataResponse<TData> extends FullDataResponse<TData> {
  readonly total: number;
}

interface ItemContext<TData> {
  item: TData;
  meta: ItemMetaContext;
}

interface ItemMetaContext {
  index: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
  count: number;
}

export declare class ItemTemplateDirective<TData> {
  readonly container: import('@angular/core').InputSignal<VirtualizeComponent<TData>>;
  templateRef: TemplateRef<{
    $implicit: ItemContext<TData>;
  }>;
  static ngTemplateContextGuard<TData>(
    dir: ItemTemplateDirective<TData>,
    ctx: unknown,
  ): ctx is {
    $implicit: ItemContext<TData>;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<ItemTemplateDirective<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ItemTemplateDirective<any>,
    '[tabItemTemplate]',
    never,
    {
      container: {
        alias: 'tabItemTemplate';
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

export declare class LoadingTemplateDirective {
  templateRef: TemplateRef<{
    $implicit: ItemMetaContext;
  }>;
  static ngTemplateContextGuard(
    dir: ItemMetaContext,
    ctx: unknown,
  ): ctx is {
    $implicit: ItemMetaContext;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<LoadingTemplateDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<LoadingTemplateDirective, '[tabItemLoadingTemplate]', never, {}, {}, never, never, false, never>;
}

type NumericUnit = `${number}${Unit}`;

type PaddingValue = NumericUnit | `${NumericUnit} ${NumericUnit}` | `${NumericUnit} ${NumericUnit} ${NumericUnit}` | `${NumericUnit} ${NumericUnit} ${NumericUnit} ${NumericUnit}`;

declare const ROW_STYLE_PROPERTIES: readonly [
  'height',
  'lineHeight',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
];

export declare class TableauUiVirtualizeModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiVirtualizeModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiVirtualizeModule,
    [typeof VirtualizeComponent, typeof ItemTemplateDirective, typeof LoadingTemplateDirective, typeof ErrorTemplateDirective, typeof CustomLoaderDirective],
    [typeof i6.CommonModule],
    [typeof VirtualizeComponent, typeof ItemTemplateDirective, typeof LoadingTemplateDirective, typeof ErrorTemplateDirective, typeof CustomLoaderDirective]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiVirtualizeModule>;
}

type Unit = 'px' | 'em' | 'rem' | '%' | '';

export declare abstract class VirtualizeBaseComponent<TData> {
  abstract $dataOptions: Signal<DataOptions<TData>>;
  abstract $dataRowCss: Signal<DataRowCss>;
  abstract $dataBlockWindow: Signal<number>;
  protected abstract readonly $sortModel: WritableSignal<DataSort[]>;
  protected abstract measureDataWindowHeightPx(): number;
  protected beforeReset?(trigger: 'auto' | 'manual'): void;
  protected readonly $dataRowComputedStyle: Signal<DataRowStyle>;
  protected readonly $dataRowHeightPx: Signal<number>;
  protected readonly dataManager: DataManager<TData>;
  protected readonly $loading: WritableSignal<boolean>;
  protected onScroll(virtualizeContainer: HTMLElement): void;
  constructor(cdr: ChangeDetectorRef);
  load(): Promise<boolean>;
  reload(): Promise<boolean>;
  reset(resetSort?: boolean): Promise<boolean>;
}

export declare class VirtualizeComponent<TData> extends VirtualizeBaseComponent<TData> {
  constructor();
  readonly $label: InputSignal<string | undefined>;
  readonly $dataOptions: InputSignal<DataOptions<TData>>;
  readonly $dataRowCss: InputSignal<DataRowCss>;
  readonly $dataWindowHeightPx: InputSignal<number | undefined>;
  readonly $dataSort: import('@angular/core').ModelSignal<DataSort[]>;
  readonly $dataBlockWindow: InputSignal<number>;
  readonly $noDataTemplate: InputSignal<string | TemplateRef<unknown>>;
  readonly $itemTemplate: import('@angular/core').Signal<ItemTemplateDirective<TData>>;
  readonly $loadingTemplate: import('@angular/core').Signal<LoadingTemplateDirective | undefined>;
  readonly $errorTemplate: import('@angular/core').Signal<ErrorTemplateDirective | undefined>;
  readonly $customLoaderTemplate: import('@angular/core').Signal<CustomLoaderDirective | undefined>;
  static ɵfac: i0.ɵɵFactoryDeclaration<VirtualizeComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    VirtualizeComponent<any>,
    'tab-virtualize',
    never,
    {
      $label: {
        alias: 'label';
        required: false;
        isSignal: true;
      };
      $dataOptions: {
        alias: 'dataOptions';
        required: true;
        isSignal: true;
      };
      $dataRowCss: {
        alias: 'dataRowCss';
        required: false;
        isSignal: true;
      };
      $dataWindowHeightPx: {
        alias: 'dataWindowHeightPx';
        required: false;
        isSignal: true;
      };
      $dataSort: {
        alias: 'dataSort';
        required: true;
        isSignal: true;
      };
      $dataBlockWindow: {
        alias: 'dataBlockWindow';
        required: false;
        isSignal: true;
      };
      $noDataTemplate: {
        alias: 'noDataTemplate';
        required: false;
        isSignal: true;
      };
    },
    {
      $dataSort: 'dataSortChange';
    },
    ['$itemTemplate', '$loadingTemplate', '$errorTemplate', '$customLoaderTemplate'],
    never,
    false,
    never
  >;
}

export type { DataSort, FullDataRequest, FullDataResponse, IncrementalDataRequest, IncrementalDataResponse, ItemContext, ItemMetaContext };
