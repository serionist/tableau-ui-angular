import type { InputSignal, ModelSignal, TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, contentChildren, ElementRef, HostListener, inject, input, model, viewChild, viewChildren } from '@angular/core';
import type { SortOrderPair } from './defs/column-def/column-def.directive';
import { ColumnDefDirective } from './defs/column-def/column-def.directive';
import { ColRenderedWidthDirective } from './column-widths/col-rendered-width.directive';
import type { SelectionOptions } from './selection/selection-options';
import { MultiSelectionOptions, SingleSelectionOptions } from './selection/selection-options';
import type { Primitive } from 'tableau-ui-angular/types';
import type { DataBlock, DataOptions, DataRowCss, DataSort } from 'tableau-ui-angular/virtualize';
import { VirtualizeBaseComponent } from 'tableau-ui-angular/virtualize';

@Component({
  selector: 'tab-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {},
})
export class TableComponent<TData> extends VirtualizeBaseComponent<TData> {
  protected readonly checkboxColWidth = '2.5em';

  readonly self = this;

  // #region View Children
  protected readonly $columnWidthDirectives = viewChildren(ColRenderedWidthDirective);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly $headerRow = viewChild.required<ElementRef<HTMLElement>>('headerRow');
  // #endregion

  constructor() {
    super(inject(ChangeDetectorRef));
  }

  // #region Inputs & Outputs
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * The column IDs to display in the table. The order of the IDs determines the order of the columns.
   * If undefined, all columns will be displayed in the order they are defined in the table.
   * @default undefined
   */
  readonly $displayedColumns: ModelSignal<string[] | undefined> = model<string[] | undefined>(undefined, {
    alias: 'displayedColumns',
  });

  /**
   * The data options for the table
   */
  readonly $dataOptions = input.required<DataOptions<TData>>({
    alias: 'dataOptions',
  });

  /**
   * The number of data blocks to load before and after the currently displayed block(s) based on scroll position.
   * This is used to determine how many blocks to load in advance for smooth scrolling.
   * A data block is a chunk of data that is loaded from the server. It's size is is whatever fits the current viewport.
   * @default 3
   */
  readonly $dataBlockWindow = input<number>(3, {
    alias: 'dataBlockWindow',
  });

  /**
   * The height of the table data row.
   * This must be a valid CSS value.
   * Fixed height is required for virtual scrolling to work properly.
   * If the height is not fixed, the table will not be able to calculate the row heights and will not be able to scroll properly.
   * @default '2.5em'
   */
  readonly $dataRowCss = input<DataRowCss>(
    {
      height: '2.5em',
      lineHeight: 'inherit',
      padding: '0 0.5em',
    },
    {
      alias: 'dataRowCss',
    },
  );

  /**
   * The margin for all header cells
   * @default '0.5em'
   */
  readonly $headerPadding = input<string>('0.5em', {
    alias: 'headerPadding',
  });

  /**
   * The sorting mode. When multi sort is enabled, holding SHIFT when clicking a column header will add it to the sort list
   * @default single
   */
  readonly $sortMode = input<'multi' | 'single'>('single', {
    alias: 'sortMode',
  });

  /**
   * The sort models. Initial sort mode can be provided here.
   * This gets updated when the sort is changed by the user on the UI dynamically
   * @default []
   */
  readonly $sort = model<DataSort[]>([], {
    alias: 'sort',
  });

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * The column ID to pin to the left side of the table.
   * If undefined, no column will be pinned to the left.
   * @default undefined
   */
  readonly $pinnedLeftColumn: ModelSignal<string | undefined> = model<string | undefined>(undefined, {
    alias: 'pinnedLeftColumn',
  });

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * The column ID to pin to the right side of the table.
   * If undefined, no column will be pinned to the right.
   * @default undefined
   */
  readonly $pinnedRightColumn: ModelSignal<string | undefined> = model<string | undefined>(undefined, {
    alias: 'pinnedRightColumn',
  });

  /**
   * Whether to show a striped table.
   * This will alternate the background color of the rows.
   * @default false
   */
  readonly $striped = model<boolean>(false, {
    alias: 'striped',
  });

  /**
   * The template to use when there is no data to display.
   * If 'default', a default template will be used.
   * If a TemplateRef is provided, it will be used as the no data template.
   * @default 'default'
   */
  readonly $noDataTemplate = input<TemplateRef<unknown> | string | 'default'>('default', {
    alias: 'noDataTemplate',
  });

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * The options for the selection mode.
   * If undefined, no selection will be enabled.
   * If a SingleSelectionOptions is provided, single selection will be enabled.
   * If a MultiSelectionOptions is provided, multi selection will be enabled.
   * @default undefined
   */
  readonly $selectionOptions: InputSignal<SelectionOptions | undefined> = input<SelectionOptions>(undefined, {
    alias: 'selectionOptions',
  });
  /**
   * The selected rows.
   * This is used to determine which rows are selected in the table.
   * If the selection options are set to single selection, this will only contain a maximum of one row.
   * If the selection options are set to multi selection, this can contain multiple rows.
   * This is updated when the selection changes.
   * @default []
   * @see {@link $selectionOptions}
   */
  readonly $selectedRows = model<Map<Primitive, TData>>(new Map<Primitive, TData>(), {
    alias: 'selectedRows',
  });

  // #endregion
  // #region Columns
  public readonly $columnDefs = contentChildren<ColumnDefDirective<TData>>(ColumnDefDirective);
  protected readonly $displayedColumnDefs = computed(
    () => {
      let columnDefs = this.$columnDefs();
      const displayedColumns = this.$displayedColumns();
      const pinnedLeftColumnId = this.$pinnedLeftColumn();
      const pinnedRightColumnId = this.$pinnedRightColumn();
      if (displayedColumns) {
        const displayColumnDefs = [];
        for (const colId of displayedColumns) {
          const colDef = columnDefs.find(e => e.$id() === colId);
          if (colDef) {
            displayColumnDefs.push(colDef);
          }
        }
        columnDefs = displayColumnDefs;
      }
      const pinnedLeftColumn = columnDefs.find(e => e.$id() === pinnedLeftColumnId);
      const pinnedRightColumn = columnDefs.find(e => e.$id() === pinnedRightColumnId);

      const ret: {
        id: string;
        col: ColumnDefDirective<TData>;
        pinnedLeft: boolean;
        pinnedRight: boolean;
        sortOrder: SortOrderPair;
      }[] = [];
      if (pinnedLeftColumn) {
        ret.push({
          id: pinnedLeftColumn.$id(),
          col: pinnedLeftColumn,
          pinnedLeft: true,
          pinnedRight: false,
          sortOrder: pinnedLeftColumn.$sortOrder(),
        });
      }
      for (const col of columnDefs.filter(e => e !== pinnedLeftColumn && e !== pinnedRightColumn)) {
        ret.push({
          id: col.$id(),
          col,
          pinnedLeft: false,
          pinnedRight: false,
          sortOrder: col.$sortOrder(),
        });
      }
      if (pinnedRightColumn) {
        ret.push({
          id: pinnedRightColumn.$id(),
          col: pinnedRightColumn,
          pinnedLeft: false,
          pinnedRight: true,
          sortOrder: pinnedRightColumn.$sortOrder(),
        });
      }
      return ret;
    },
    {
      equal: (a, b) => {
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0; i < a.length; i++) {
          if (a[i].id !== b[i].id || a[i].pinnedLeft !== b[i].pinnedLeft || a[i].pinnedRight !== b[i].pinnedRight || a[i].col.$id() !== b[i].col.$id()) {
            return false;
          }
        }
        return true;
      },
    },
  );
  // #endregion
  // #region Load & Reset
  // load(), reload() and reset() are the base's: the sort the data loads with is the table's, and the window the rows
  // are shown in is the host's height under the header row
  protected readonly $sortModel = this.$sort;

  protected measureDataWindowHeightPx(): number {
    return this.hostElement.nativeElement.clientHeight - this.$headerRow().nativeElement.clientHeight;
  }

  // The selection options say which resets clear the selection; reading them here doesn't make them reset the data
  protected override beforeReset(trigger: 'auto' | 'manual') {
    const selectionOptions = this.$selectionOptions();
    const clear = trigger === 'manual' ? selectionOptions?.clearSelectedKeysOnManualReset !== false : selectionOptions?.clearSelectedKeysOnAnyReset === true;
    if (clear) {
      this.$selectedRows.set(new Map<Primitive, TData>());
    }
  }
  // #endregion

  // #region Sort
  protected onColumnHeaderClick(e: MouseEvent, def: ColumnDefDirective<TData>) {
    if (!def.$sortable()) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).blur();

    const propertyName = def.$propertyName() ?? def.$id();
    const sort = this.$sort();
    const sortOrder = def.$sortOrder();
    const currentSort = sort.find(f => f.property === propertyName);
    if (this.$sortMode() === 'single' || !e.shiftKey) {
      if (currentSort?.direction === sortOrder[1]) {
        this.$sort.set([]);
      } else {
        this.$sort.set([
          {
            property: propertyName,
            direction: currentSort === undefined ? sortOrder[0] : currentSort.direction === 'asc' ? 'desc' : 'asc',
          },
        ]);
      }
    } else {
      for (const s of sort) {
        if (s.property === propertyName) {
          // toggle sort mode
          if (s.direction === def.$sortOrder()[1]) {
            // remove sort
            this.$sort.set(sort.filter(f => f.property !== propertyName));
            return;
          } else {
            // a new object for the turned column: the list's may be the app's own
            const direction = s.direction === 'asc' ? 'desc' : 'asc';
            this.$sort.set(sort.map(f => (f === s ? { ...f, direction } : f)));
          }

          return;
        }
      }
      // add new sort
      this.$sort.set([
        ...sort,
        {
          property: propertyName,
          direction: def.$sortOrder()[0],
        },
      ]);
    }
  }
  // #endregion
  // #region Scrolling & Virtualization
  @HostListener('scroll', ['$any($event.target)'])
  protected onHostScrolled(element: HTMLElement) {
    super.onScroll(element);
  }
  // #endregion

  // #region Selection

  // #region MultiSelect Header Checkbox
  // Checked when the selection holds every row of the full load, partial when it holds some; it follows each reset's
  // load, since the data manager's all-data info is a signal
  protected readonly $selectionMultiHeaderCheckboxSelected = computed<boolean | 'partial'>(() => {
    const selectedRows = this.$selectedRows();
    if (selectedRows.size === 0) {
      return false;
    }
    const allDataInfo = this.dataManager.$allDataInfo();
    if (allDataInfo?.$status() === 'success' && [...allDataInfo.$allKeys()].every(key => selectedRows.has(key))) {
      return true;
    }
    return 'partial';
  });
  selectionMultiHeaderCheckboxSelectNoneChanged() {
    this.$selectedRows.set(new Map<Primitive, TData>());
  }
  async selectionMultiHeaderCheckboxSelectAllChanged(val: boolean | 'partial') {
    if (val === true) {
      if (this.dataManager.allDataInfo?.$status() !== 'success') {
        return;
      }
      const allData = await this.dataManager.allDataInfo.promise;
      this.$selectedRows.set(new Map<Primitive, TData>(allData.map(e => [e.key, e.data])));
    } else {
      this.$selectedRows.set(new Map<Primitive, TData>());
    }
  }
  // #endregion

  // A click on a row selects it, unless it was meant for a control in a cell, such as a link, a checkbox (the row's own
  // selection checkbox included) or a button: that click is the control's, and isn't cancelled
  protected rowClicked(row: TData, block: DataBlock<TData>, e: MouseEvent) {
    const selectionOptions = this.$selectionOptions();
    if (!selectionOptions) {
      return;
    }
    if (selectionOptions.selectionMode !== 'row-and-checkbox') {
      return;
    }
    const control = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
    if (control !== null && e.currentTarget instanceof Element && e.currentTarget.contains(control)) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    // a row still loading is a placeholder, not the app's row
    if (block.$status() !== 'success') {
      return;
    }
    const dataOptions = this.$dataOptions();
    const key = dataOptions.getRowKey(row);
    const selectedRows = this.$selectedRows();
    const isSelected = selectedRows.has(key);

    if (selectionOptions instanceof MultiSelectionOptions) {
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        this.checkboxSelectChange(row, !isSelected);
      } else {
        this.$selectedRows.set(new Map<Primitive, TData>([[key, row]]));
      }
    } else if (selectionOptions instanceof SingleSelectionOptions) {
      if (isSelected) {
        this.$selectedRows.set(new Map<Primitive, TData>());
      } else {
        this.$selectedRows.set(new Map<Primitive, TData>([[key, row]]));
      }
    }
  }
  protected checkboxSelectChange(row: TData, checked: boolean | 'partial') {
    const selectionOptions = this.$selectionOptions();
    if (!selectionOptions) {
      return;
    }
    const dataOptions = this.$dataOptions();
    if (selectionOptions instanceof MultiSelectionOptions) {
      const key = dataOptions.getRowKey(row);
      // a copy changed: the Map may be the app's own
      const selectedRows = new Map<Primitive, TData>(this.$selectedRows());
      if (checked === true) {
        selectedRows.set(key, row);
      } else {
        selectedRows.delete(key);
      }
      this.$selectedRows.set(selectedRows);
    } else if (selectionOptions instanceof SingleSelectionOptions) {
      const key = dataOptions.getRowKey(row);
      if (checked === true) {
        this.$selectedRows.set(new Map<Primitive, TData>([[key, row]]));
      } else {
        this.$selectedRows.set(new Map<Primitive, TData>());
      }
    }
  }

  // #endregion

  // #region Line clamping

  // The lines of text a cell holds, from the row's CSS, so a change to dataRowCss clamps to its rows; the clamp takes
  // no height of its own, since -webkit-line-clamp clamps it, and a row's normal line height measures no pixels
  protected readonly $lineClampRows = computed(() => {
    try {
      const cellStyle = this.$dataRowComputedStyle();
      const getPxValue = (prop: string, value: string) => {
        if (value.endsWith('px')) {
          return parseFloat(value);
        } else {
          throw new Error(`Failed to initialize line clamping. Invalid CSS value for ${prop}: ${value}. Expected a pixel value.`);
        }
      };
      const lineHeight = getPxValue('line-height', cellStyle.lineHeight);
      const paddingTop = getPxValue('padding-top', cellStyle.paddingTop);
      const paddingBottom = getPxValue('padding-bottom', cellStyle.paddingBottom);
      const height = getPxValue('height', cellStyle.height);

      const rowHeight = height - paddingTop - paddingBottom;

      return Math.max(Math.floor(rowHeight / lineHeight), 1);
    } catch (error: unknown) {
      // once: the clamp holds one line then, and each reload() would say it again
      if (!this.lineClampWarned) {
        this.lineClampWarned = true;
        console.warn('Failed to initialize line clamp:', error);
      }
      return 1;
    }
  });
  private lineClampWarned = false;
  // #endregion
}

// What a click in a cell can be meant for instead of the row: native controls, the library's button toggle, whose
// options have no role yet, and the WAI-ARIA widget roles
const INTERACTIVE = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  'tab-button-toggle',
  ...['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'option', 'menuitem', 'combobox', 'slider', 'spinbutton', 'textbox', 'searchbox'].map(role => `[role="${role}"]`),
].join(', ');
