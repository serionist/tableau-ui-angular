import type { InputSignal, ModelSignal, TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, contentChildren, effect, ElementRef, HostListener, inject, input, model, signal, untracked, viewChild, viewChildren } from '@angular/core';
import type { SortOrderPair } from './defs/column-def/column-def.directive';
import { ColumnDefDirective } from './defs/column-def/column-def.directive';
import type { DataSort } from './sorting/data-sort';
import { ColRenderedWidthDirective } from './column-widths/col-rendered-width.directive';
import { DataManager } from './data/data-manager';
import type { SelectionOptions } from './selection/selection-options';
import { MultiSelectionOptions, SingleSelectionOptions } from './selection/selection-options';
import type { DataOptions } from './data/data-options';
import type { Primitive } from 'tableau-ui-angular/types';

@Component({
    selector: 'tab-table',
    standalone: false,
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {},
})
export class TableComponent<TData = number>  {
    protected readonly checkboxColWidth = '2.5em';

    readonly self = this;
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
    readonly $dataRowHeight = input<string>('2.5em', {
        alias: 'dataRowHeight',
    });

    /**
     * The margin for all header cells
     * @default '0.5em'
     */
    readonly $headerPadding = input<string>('0.5em', {
        alias: 'headerPadding',
    });

    /**
     * The margin for all data cells
     * @default '0 0.5em'
     */
    readonly $dataPadding = input<string>('0 0.5em', {
        alias: 'dataPadding',
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
                    const colDef = columnDefs.find((e) => e.$id() === colId);
                    if (colDef) {
                        displayColumnDefs.push(colDef);
                    }
                }
                columnDefs = displayColumnDefs;
            }
            const pinnedLeftColumn = columnDefs.find((e) => e.$id() === pinnedLeftColumnId);
            const pinnedRightColumn = columnDefs.find((e) => e.$id() === pinnedRightColumnId);

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
            for (const col of columnDefs.filter((e) => e !== pinnedLeftColumn && e !== pinnedRightColumn)) {
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
    // #region View Children
    protected readonly $columnWidthDirectives = viewChildren(ColRenderedWidthDirective);
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
    private readonly $headerRow = viewChild.required<ElementRef<HTMLElement>>('headerRow');
    private readonly $dataRowSizer = viewChild.required<ElementRef<HTMLElement>>('dataSizer');
    // #endregion
    protected readonly _dataManager = new DataManager<TData>(this.cdr);
    get dataManager() {
        return this._dataManager;
    }
    // #region Load & Reset
    private loaded = false;
    private dataWindowHeightPx: number = 0;
    private dataRowHeightPx: number = 0;

    /**
     * Loads the table data. Only callable once. If the table is already loaded, this will do nothing.
     * This will calculate the available window and row height and reset() the table.
     * Use this to load the table initially
     * Use reload() to reload the table data if the table size or row size changes
     */
    async load() {
        if (this.loaded) {
            return false;
        }
        return this.reload();
    }
    /**
     * Reloads the table data.
     * This will re-calculate the available window and row height and reset() the table.
     * Use this to reload the table data if the table size or row size changes
     */
    async reload() {
        this.loaded = false;
        this.initializeLineClamp();
        const host = this.hostElement.nativeElement;
        // calculate data window height
        this.dataWindowHeightPx = host.clientHeight - this.$headerRow().nativeElement.clientHeight;

        this.dataRowHeightPx = this.$dataRowSizer().nativeElement.clientHeight;

        const initialLoad = await this.resetInternal(this.$sort(), this.$dataOptions(), this.$dataBlockWindow());
        if (initialLoad) {
            this.loaded = true;
        }
        return initialLoad;
    }
    private readonly dataManagerReset = effect(() => {
        const sort = this.$sort();
        const dataOptions = this.$dataOptions();
        const dataBlockWindow = this.$dataBlockWindow();
        const selectionOptions = this.$selectionOptions();
        if (!this.loaded) {
            return;
        }
        if (selectionOptions?.clearSelectedKeysOnAnyReset === true) {
            this.$selectedRows.set(new Map<Primitive, TData>());
        }
        if (!this.loaded) {
            return;
        }

        untracked(() => void this.resetInternal(sort, dataOptions, dataBlockWindow));
    });
    private async resetInternal(sort: DataSort[] | undefined, dataOptions: DataOptions<TData> | undefined, dataBlockWindow: number): Promise<boolean> {
        if (this.dataRowHeightPx === 0 || this.dataWindowHeightPx === 0 || !sort || !dataOptions) {
            console.warn('Table reset called with undefined parameters, ignoring');
            return false;
        }
        await this._dataManager.reset(this.dataWindowHeightPx, this.dataRowHeightPx, sort, dataBlockWindow, dataOptions);
        return true;
    }

    /**
     * Resets the table to its initial state.
     * This will reset the scroll position, data, and optionally selection.
     * If resetSort is true, the sort will also be reset to the initial state.
     * @param resetSort Whether to reset the sort to the initial state
     * @returns A promise that resolves to true if the reset was successful, false otherwise.
     */
    async reset(resetSort: boolean = false): Promise<boolean> {
        if (!this.loaded) {
            return false;
        }
        if (resetSort) {
            this.$sort.set([]);
        }
        const sort = this.$sort();
        const dataOptions = this.$dataOptions();
        const dataBlockWindow = this.$dataBlockWindow();
        const selectionOptions = this.$selectionOptions();
        if (selectionOptions?.clearSelectedKeysOnManualReset !== false) {
            this.$selectedRows.set(new Map<Primitive, TData>());
        }
        return this.resetInternal(sort, dataOptions, dataBlockWindow);
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
        const currentSort = sort.find((f) => f.property === propertyName);
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
                        // emove sort
                        this.$sort.set(sort.filter((f) => f.property !== propertyName));
                        return;
                    } else {
                        s.direction = s.direction === 'asc' ? 'desc' : 'asc';
                        this.$sort.set([...sort]);
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
    @HostListener('scroll', ['$event.target'])
    private onScroll(element: HTMLElement) {
        this._dataManager.setScrollPosition(element.scrollTop);
    }
    // #endregion

    // #region Selection

    // #region MultiSelect Header Checkbox
    protected readonly $selectionMultiHeaderCheckboxSelected = model<boolean | 'partial'>(this.$selectedRows().size > 0 ? 'partial' : false);
    selectionMultiHeaderCheckboxSelectNoneChanged() {
        this.$selectedRows.set(new Map<Primitive, TData>());
    }
    async selectionMultiHeaderCheckboxSelectAllChanged(val: boolean | 'partial') {
        if (val === true) {
            if (this._dataManager.allDataInfo?.$status() !== 'success') {
                return;
            }
            const allData = await this._dataManager.allDataInfo.promise;
            this.$selectedRows.set(new Map<Primitive, TData>(allData.map((e) => [e.key, e.data])));
        } else {
            this.$selectedRows.set(new Map<Primitive, TData>());
        }
    }
    private readonly updateSelectionMultiHeaderCheckboxSelected = effect(() => {
        let value: boolean | 'partial' = false;
        const selectedRows = this.$selectedRows();
        if (selectedRows.size === 0) {
            value = false;
        } else if (this._dataManager.allDataInfo?.$status() === 'success' && [...this._dataManager.allDataInfo.$allKeys().keys()].every((key) => selectedRows.has(key))) {
            value = true;
        } else {
            value = 'partial';
        }
        this.$selectionMultiHeaderCheckboxSelected.set(value);
    });
    // #endregion

    protected rowClicked(row: TData, e: MouseEvent) {
        const selectionOptions = this.$selectionOptions();
        if (!selectionOptions) {
            return;
        }
        if (selectionOptions.selectionMode !== 'row-and-checkbox') {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
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

        // select the row
    }
    protected checkboxClicked(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
    }
    protected checkboxSelectChange(row: TData, checked: boolean | 'partial') {
        const selectionOptions = this.$selectionOptions();
        if (!selectionOptions) {
            return;
        }
        const dataOptions = this.$dataOptions();
        if (selectionOptions instanceof MultiSelectionOptions) {
            const key = dataOptions.getRowKey(row);
            const selectedRows = this.$selectedRows();
            if (checked === true) {
                selectedRows.set(key, row);
            } else {
                selectedRows.delete(key);
            }
            this.$selectedRows.set(new Map<Primitive, TData>(selectedRows));
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

    protected readonly $lineClampRows = signal<number>(1);
    protected readonly $lineClampElementHeightPx = signal<number>(0);
    private initializeLineClamp() {
        const rowSizer = this.$dataRowSizer().nativeElement;
        try {
            const cellStyle = getComputedStyle(rowSizer);
            const cellLineHeightString = cellStyle.lineHeight;
            const cellLineHeightPx = cellLineHeightString.endsWith('px') ? parseFloat(cellLineHeightString) : parseFloat(cellLineHeightString) * parseFloat(cellStyle.fontSize);
            const cellPaddingTop = parseFloat(cellStyle.paddingTop);
            const cellPaddingBottom = parseFloat(cellStyle.paddingBottom);
            const rowHeight = rowSizer.clientHeight - cellPaddingTop - cellPaddingBottom;

            const rows = Math.max(Math.floor(rowHeight / cellLineHeightPx), 1);
            this.$lineClampRows.set(rows);
            this.$lineClampElementHeightPx.set(cellLineHeightPx * rows);
        } catch (error: unknown) {
            console.warn('Failed to initialize line clamp:', error);
        }
    }

}
