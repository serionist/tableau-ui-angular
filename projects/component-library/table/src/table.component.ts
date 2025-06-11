import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, contentChildren, effect, ElementRef, HostListener, inject, input, model, resource, untracked, viewChild, viewChildren } from '@angular/core';
import type { SortOrderPair } from './defs/column-def/column-def.directive';
import { ColumnDefDirective } from './defs/column-def/column-def.directive';
import type { DataSort } from './sorting/data-sort';
import { ColRenderedWidthDirective } from './column-widths/col-rendered-width.directive';
import { DataManager } from './data/data-manager';
import type { DataRequest } from './data/data-request';
import type { DataResponse } from './data/data-response';
import type { Primitive } from 'tableau-ui-angular/types';
import { MultiSelectionOptions, SelectAllOptions, SingleSelectionOptions } from './selection/selection-options';

@Component({
    selector: 'tab-table',
    standalone: false,
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {},
})
export class TableComponent<TData = unknown, TKey extends Primitive = null> {
    protected readonly checkboxColWidth = '2.5em';
    
    // #region Inputs & Outputs
    /**
     * The column IDs to display in the table. The order of the IDs determines the order of the columns.
     * If undefined, all columns will be displayed in the order they are defined in the table.
     * @default undefined
     */
    readonly $displayedColumns = input<string[] | undefined>(undefined, {
        alias: 'displayedColumns',
    });

    /**
     * The function to get a data block. Provides an offset, count, sort and an abortsignal
     * Handling abort is recommended, as many block requests may be fired that are canceled when the user scrolls fast
     */
    readonly $getDataBlock = input.required<(req: DataRequest) => Promise<DataResponse<TData>>>({
        alias: 'getDataBlock',
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

    /**
     * The column ID to pin to the left side of the table.
     * If undefined, no column will be pinned to the left.
     * @default undefined
     */
    readonly $pinnedLeftColumn = input<string | undefined>(undefined, {
        alias: 'pinnedLeftColumn',
    });

    /**
     * The column ID to pin to the right side of the table.
     * If undefined, no column will be pinned to the right.
     * @default undefined
     */
    readonly $pinnedRightColumn = input<string | undefined>(undefined, {
        alias: 'pinnedRightColumn',
    });

    /**
     * Whether to show a striped table.
     * This will alternate the background color of the rows.
     * @default false
     */
    readonly $striped = input<boolean>(false, {
        alias: 'striped',
    });

    /**
     * The template to use when there is no data to display.
     * If 'default', a default template will be used.
     * If a TemplateRef is provided, it will be used as the no data template.
     * @default 'default'
     */
    readonly $noDataTemplate = input<TemplateRef<unknown> | 'default'>('default', {
        alias: 'noDataTemplate',
    });

    /**
     * Whether to reset the table when the size of the table changes.
     * This is useful when the table is resized and you want to reset the scroll position and data.
     * This can only be set once.
     * @default false
     */
    readonly $resetOnSizeChange = input(false, {
        alias: 'resetOnSizeChange',
    });

    /**
     * The options for the selection mode.
     * If undefined, no selection will be enabled.
     * If a SingleSelectionOptions is provided, single selection will be enabled.
     * If a MultiSelectionOptions is provided, multi selection will be enabled.
     * @default undefined
     */
    readonly $selectionOptions = input<SingleSelectionOptions<TData, TKey> | MultiSelectionOptions<TData, TKey>>(undefined, {
        alias: 'selectionOptions',
    });
    /**
     * The keys of the selected rows.
     * This is used to determine which rows are selected in the table.
     * If the selection options are set to single selection, this will only contain a maximum of one key.
     * If the selection options are set to multi selection, this can contain multiple keys.
     * This is updated when the selection changes.
     * @default []
     * @see {@link $selectionOptions}
     */
    readonly $selectedKeys = model<TKey[]>([], {
        alias: 'selectedKeys',
    });

    // #endregion
    // #region Columns
    public readonly $columnDefs = contentChildren(ColumnDefDirective);
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
                col: ColumnDefDirective;
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
    protected readonly dataManager = new DataManager<TData>(this.cdr);
    // #region Load & Reset
    private loaded = false;
    private dataWindowHeightPx: number = 0;
    private dataRowHeightPx: number = 0;

    /**
     * Loads the table data.
     * This will calculate the available window and row height and reset the table.
     * Use this to load the table initially, or after it's container or row size changes.
     */
    async load() {
        this.loaded = false;
        const host = this.hostElement.nativeElement;
        // calculate data window height
        this.dataWindowHeightPx = host.clientHeight - this.$headerRow().nativeElement.clientHeight;
        console.log('calculated data window height:', this.dataWindowHeightPx, host.clientHeight, this.$headerRow().nativeElement.clientHeight);

        this.dataRowHeightPx = this.$dataRowSizer().nativeElement.clientHeight;
        console.log('calculated data row height:', this.dataRowHeightPx);

        const initialLoad = await this.resetInternal(this.$sort(), this.$getDataBlock(), this.$dataBlockWindow(), this.$displayedColumnDefs());
        if (initialLoad) {
            this.loaded = true;
        }
        return initialLoad;
    }
    private readonly dataManagerReset = effect(() => {
        if (!this.loaded) {
            return;
        }
        const sort = this.$sort();
        const getDataBlock = this.$getDataBlock();
        const dataBlockWindow = this.$dataBlockWindow();
        const displayedColumns = this.$displayedColumnDefs();
        const selectionOptions = untracked(() => this.$selectionOptions());
        if (selectionOptions?.clearSelectedKeysOnAnyReset === true) {
            this.$selectedKeys.set([]);
        }

        untracked(() => void this.resetInternal(sort, getDataBlock, dataBlockWindow, displayedColumns));
    });
    private async resetInternal(
        sort: DataSort[] | undefined,
        getDataBlock: ((req: DataRequest) => Promise<DataResponse<TData>>) | undefined,
        dataBlockWindow: number,
        displayedColumns:
            | {
                  id: string;
                  col: ColumnDefDirective;
                  pinnedLeft: boolean;
                  pinnedRight: boolean;
                  sortOrder: SortOrderPair;
              }[]
            | undefined,
    ): Promise<boolean> {
        if (this.dataRowHeightPx === 0 || this.dataWindowHeightPx === 0 || !sort || !getDataBlock || !displayedColumns) {
            console.warn('Table reset called with undefined parameters, ignoring');
            return false;
        }
        console.log('resetting data manager with:', {
            dataWindowHeightPx: this.dataWindowHeightPx,
            dataRowHeightPx: this.dataRowHeightPx,
            sort,
            getDataBlock,
            dataBlockWindow,
            displayedColumns,
        });
        await this.dataManager.reset(
            this.dataWindowHeightPx,
            this.dataRowHeightPx,
            sort,
            displayedColumns.map((e) => e.id),
            dataBlockWindow,
            getDataBlock,
        );
        return true;
    }

    /**
     * Resets the table to its initial state.
     * This will reset the scroll position, data, and selection.
     * If resetSort is true, the sort will also be reset to the initial state.
     * @param resetSort Whether to reset the sort to the initial state
     * @returns A promise that resolves to true if the reset was successful, false otherwise.
     */
    async reset(resetSort: boolean = false): Promise<boolean> {
        if (resetSort) {
            this.$sort.set([]);
        }
        const sort = this.$sort();
        const getDataBlock = this.$getDataBlock();
        const dataBlockWindow = this.$dataBlockWindow();
        const displayedColumns = this.$displayedColumnDefs();
        const selectionOptions = this.$selectionOptions();
        this.allMultiSelectionKeys.reload();
        if (selectionOptions?.clearSelectedKeysOnManualReset === true) {
            this.$selectedKeys.set([]);
        }
        return this.resetInternal(sort, getDataBlock, dataBlockWindow, displayedColumns);
    }
    // #endregion

    // #region Sort
    protected onColumnHeaderClick(e: MouseEvent, def: ColumnDefDirective) {
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
        this.dataManager.setScrollPosition(element.scrollTop);
    }
    // #endregion

    // #region Selection

    // #region MultiSelect Header Checkbox
    protected readonly allMultiSelectionKeys = resource({
        defaultValue: [],
        params: this.$selectionOptions,
        loader: async (opts) => {
            const p = opts.params;
            if (p === undefined || !(p instanceof MultiSelectionOptions) || !(p.headerCheckboxMode instanceof SelectAllOptions)) {
                throw new Error('Cannot load all multi selection keys, selection options are not set or not a MultiSelectionOptions with SelectAllOptions');
            }
            const allKeys = p.headerCheckboxMode.getAllRowKeys;
            return allKeys(opts.abortSignal) ?? Promise.resolve([]);
        },
    });
    protected readonly $selectionMultiHeaderCheckboxSelected = model<boolean | 'partial'>(this.$selectedKeys().length > 0 ? 'partial' : false);
    selectionMultiHeaderCheckboxSelectNoneChanged() {
        this.$selectedKeys.set([]);
    }
    selectionMultiHeaderCheckboxSelectAllChanged(val: boolean | 'partial') {
        if (val === true) {
            if (this.allMultiSelectionKeys.status() !== 'resolved') {
                throw new Error('Cannot select all rows, allMultiSelectionKeys is not resolved');
            }
            const allKeys = this.allMultiSelectionKeys.value();
            this.$selectedKeys.set(allKeys);
        } else {
            this.$selectedKeys.set([]);
        }
    }
    private readonly updateSelectionMultiHeaderCheckboxSelected = effect(() => {
        let value: boolean | 'partial' = false;
        const selectedKeys = this.$selectedKeys();
        if (selectedKeys.length === 0) {
            value = false;
        } else if (this.allMultiSelectionKeys.status() === 'resolved' && this.allMultiSelectionKeys.value().length === selectedKeys.length) {
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

        const key = selectionOptions.getRowKey(row);
        const selectedKeys = this.$selectedKeys();
        const isSelected = selectedKeys.includes(key);

        if (selectionOptions instanceof MultiSelectionOptions) {
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                this.checkboxSelectChange(row, !isSelected);
            } else {
                this.$selectedKeys.set([key]);
            }
        } else if (selectionOptions instanceof SingleSelectionOptions) {
            if (isSelected) {
                this.$selectedKeys.set([]);
            } else {
                this.$selectedKeys.set([key]);
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
        if (selectionOptions instanceof MultiSelectionOptions) {
            const key = selectionOptions.getRowKey(row);
            const selectedKeys = this.$selectedKeys();
            if (checked === true) {
                if (!selectedKeys.includes(key)) {
                    this.$selectedKeys.set([...selectedKeys, key]);
                }
            } else {
                this.$selectedKeys.set(selectedKeys.filter((k) => k !== key));
            }
        } else if (selectionOptions instanceof SingleSelectionOptions) {
            const key = selectionOptions.getRowKey(row);
            if (checked === true) {
                this.$selectedKeys.set([key]);
            } else {
                this.$selectedKeys.set([]);
            }
        }
    }

    // #endregion
}
