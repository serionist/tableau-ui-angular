import type { InputSignal, ModelSignal, TemplateRef } from '@angular/core';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  HostListener,
  inject,
  input,
  model,
  Renderer2,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import type { SortOrderPair } from './defs/column-def/column-def.directive';
import { ColumnDefDirective } from './defs/column-def/column-def.directive';
import { ColRenderedWidthDirective } from './column-widths/col-rendered-width.directive';
import type { SelectionOptions } from './selection/selection-options';
import { MultiSelectionOptions, SingleSelectionOptions } from './selection/selection-options';
import type { Primitive } from 'tableau-ui-angular/types';
import type { DataBlock, DataOptions, DataRowCss, DataSort } from 'tableau-ui-angular/virtualize';
import { VirtualizeBaseComponent } from 'tableau-ui-angular/virtualize';
import { generateRandomString } from 'tableau-ui-angular/utils';

/**
 * A table that draws only the rows near its view, and scrolls them in its own host.
 *
 * The host takes focus, so the keyboard scrolls it in every browser, however little in it takes focus; a static
 * `tabindex="-1"` the app writes on `tab-table` takes it out of the Tab order. With `label`, or a static `aria-label`
 * the app writes on `tab-table`, the host is a `region` of that name, and its table too; `label` wins. A static `role`
 * the app writes on `tab-table` stays.
 *
 * Its header row and each data row are `row`s, the data rows in a `rowgroup`. A table that draws only some of its rows
 * says how many it has, `aria-rowcount`, the header row included and `-1` until a load says the total, and each row its
 * place, `aria-rowindex`, 1 for the header row. The first sort's column header has `aria-sort`; a later sort's button
 * says its place, "sort 2, descending". Enter or a click on a header sorts and keeps focus on its button; with
 * `sortMode` multi, Shift+Enter, Shift+Space and Shift+Click add the column to the sort. With selection on, each loaded
 * row has `aria-selected`, and its checkbox is named "Select" and `rowLabel`'s name for it, or its place, "Select row
 * 12".
 *
 * A resizable column's header holds a resizer after its button: a focusable `separator` named "Resize" and the
 * header's text, whose value is the column's width in pixels, "180 pixels". Right and Left change the width by 10px,
 * 50px with Shift; Home and End take it to its minimum and maximum width, or without a maximum to the table's visible
 * width; a mouse, a finger or a pen drags it. Each column header is named by its text alone; a header whose text has no
 * words, as a blank one or an icon alone, is named by its place, "Column 3", and its resizer "Resize Column 3".
 */
@Component({
  selector: 'tab-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '0',
    '[attr.role]': '$role()',
    '[attr.aria-label]': '$ariaLabel()',
  },
})
export class TableComponent<TData> extends VirtualizeBaseComponent<TData> {
  protected readonly checkboxColWidth = '2.5em';
  // the start of the ids that name the column headers and their resizers
  protected readonly ids = generateRandomString();
  // The app's own static role and name on the host. The bindings keep them, since a binding that returned null would
  // remove them at the first change detection
  private readonly appRole = inject(new HostAttributeToken('role'), { optional: true });
  private readonly appAriaLabel = inject(new HostAttributeToken('aria-label'), { optional: true });

  readonly self = this;

  // #region View Children
  protected readonly $columnWidthDirectives = viewChildren(ColRenderedWidthDirective);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly $headerRow = viewChild.required<ElementRef<HTMLElement>>('headerRow');
  // #endregion

  // Whether Shift is held with the Enter or Space a header's button turns into a click: the button's own click for
  // Space carries no Shift, nor does Firefox's for Enter. Taken in the capture phase, before the button makes its click.
  // Space by its code, as the button finds it: with Shift some layouts type another character on it
  private keyShift = false;

  constructor() {
    super(inject(ChangeDetectorRef));
    const renderer = inject(Renderer2);
    const host = this.hostElement.nativeElement;
    const unlisten = [
      renderer.listen(
        host,
        'keydown',
        (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.code === 'Space') {
            this.keyShift = e.shiftKey;
          }
        },
        { capture: true },
      ),
      renderer.listen(
        host,
        'keyup',
        () => {
          this.keyShift = false;
        },
        { capture: true },
      ),
    ];
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      unlisten.forEach(stop => {
        stop();
      });
    });
    // in the browser only: the server renders each resizer named by its header's text
    afterNextRender(() => {
      const observer = new MutationObserver(() => {
        this.readUntitled();
      });
      observer.observe(this.$headerRow().nativeElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-hidden', 'aria-label', 'hidden', 'alt'] });
      this.readUntitled();
      destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
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
   * The CSS of each data cell: its height, line height and padding, and any other CSS.
   * The height must be a fixed CSS length for virtual scrolling to work properly.
   * It is the height of the cell's content: a row is drawn that tall plus its cells' vertical padding and borders.
   * @default { height: '2.5em', lineHeight: 'inherit', padding: '0 0.5em' }
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
   * The sorting mode. When multi sort is enabled, holding SHIFT when clicking a column header, or pressing Shift+Enter or
   * Shift+Space on it, adds it to the sort list
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

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * Names the table for screen readers, and the region its host is: "Orders". A table that scrolls needs it, or a static
   * `aria-label` on `tab-table`: its host takes focus, so a screen reader names what the keyboard reached.
   * @default undefined
   */
  readonly $label: InputSignal<string | undefined> = input<string>(undefined, {
    alias: 'label',
  });

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * Names a row for screen readers, from its data: each row's selection checkbox is named "Select" and what this returns,
   * "Select Ada Lovelace". Without it, or when it returns no words, the checkbox is named by the row's place in the data,
   * "Select row 12".
   * @default undefined
   */
  readonly $rowLabel: InputSignal<((row: TData) => string) | undefined> = input<(row: TData) => string>(undefined, {
    alias: 'rowLabel',
  });

  // #endregion
  // #region Accessibility
  // the label, else the app's own static aria-label, whichever has words
  protected readonly $name = computed(() => words(this.$label()) ?? words(this.appAriaLabel));
  // A region, which a name must name, so none without one
  protected readonly $role = computed(() => this.appRole ?? (this.$name() === undefined ? null : 'region'));
  protected readonly $ariaLabel = computed(() => this.$name() ?? null);

  // The ids of the columns whose header text has no words, as a blank header or an icon alone hidden from assistive
  // technology: their text shows their place, hidden, "Column 3", which names the header, its button and its resizer.
  // Read in the browser after the first render and whenever the header row's content changes
  protected readonly $untitled = signal<Readonly<Record<string, boolean>>>({});

  private readUntitled() {
    const untitled: Record<string, boolean> = {};
    for (const header of Array.from(this.$headerRow().nativeElement.querySelectorAll<HTMLElement>(':scope > .column-header[data-column-id]'))) {
      const text = header.querySelector('.header-button .text');
      if (text !== null && !hasWords(text)) {
        untitled[header.getAttribute('data-column-id')!] = true;
      }
    }
    if (Object.keys(untitled).join(' ') !== Object.keys(this.$untitled()).join(' ')) {
      this.$untitled.set(untitled);
    }
  }
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
  // A click, or Enter or Space through the click the button makes, sorts by the column; focus stays on the button,
  // whose tooltip shows the new sort. A click the keyboard makes, with no pointer behind it, adds to a multi-sort when
  // its key was pressed with Shift
  protected onColumnHeaderClick(e: MouseEvent, def: ColumnDefDirective<TData>) {
    if (!def.$sortable()) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const addToMultiSort = e.shiftKey || (e.detail === 0 && this.keyShift);
    // read once: a click made later, without its key, mustn't take it
    this.keyShift = false;
    this.sortBy(def, addToMultiSort);
  }

  // Sorts by the column alone, or with addToMultiSort, adds it to a multi-sort, turns it, or drops it
  private sortBy(def: ColumnDefDirective<TData>, addToMultiSort: boolean) {
    const propertyName = def.$propertyName() ?? def.$id();
    const sort = this.$sort();
    const sortOrder = def.$sortOrder();
    const currentSort = sort.find(f => f.property === propertyName);
    if (this.$sortMode() === 'single' || !addToMultiSort) {
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
  // no height of its own, since -webkit-line-clamp clamps it, and a row's normal line height measures no pixels. The
  // cell's content is its height tall, its padding outside it
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
      const height = getPxValue('height', cellStyle.height);

      return Math.max(Math.floor(height / lineHeight), 1);
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

// A name, unless it has no words
function words(name: string | null | undefined): string | undefined {
  return name !== null && name !== undefined && name.trim() !== '' ? name : undefined;
}

// Whether an element says anything to a screen reader: text outside its aria-hidden and hidden parts, an aria-label, or
// an image's alt. A header's place, which shows only while the rest says nothing, isn't counted
function hasWords(element: Element): boolean {
  for (const node of Array.from(element.childNodes)) {
    if (node instanceof Element) {
      if (node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('hidden') || node.classList.contains('column-place')) {
        continue;
      }
      const label = node.getAttribute('aria-label') ?? (node instanceof HTMLImageElement ? node.alt : '');
      if (label.trim() !== '' || hasWords(node)) {
        return true;
      }
    } else if (node instanceof Text && node.data.trim() !== '') {
      return true;
    }
  }
  return false;
}

// What a click in a cell can be meant for instead of the row: native controls, the library's button toggle, whose
// border between its radios is the toggle's too, and the WAI-ARIA widget roles
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
