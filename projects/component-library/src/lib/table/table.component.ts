import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    contentChildren,
    effect,
    ElementRef,
    HostListener,
    inject,
    input,
    model,
    OnDestroy,
    resource,
    ResourceLoader,
    ResourceLoaderParams,
    signal,
    TemplateRef,
    untracked,
    viewChild,
    viewChildren,
} from '@angular/core';
import { ColumnDefDirective, SortOrderPair } from './defs/column-def/column-def.directive';
import { DataSort } from './sorting/data-sort';
import { ColRenderedWidthDirective } from './column-widths/col-rendered-width.directive';
import { DataManager } from './data/data-manager';
import { DataRequest } from './data/data-request';
import { DataResponse } from './data/data-response';

@Component({
    selector: 'tab-table',
    standalone: false,
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {},
})
export class TableComponent implements AfterViewInit, OnDestroy {
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
    readonly $getDataBlock = input.required<(req: DataRequest) => Promise<DataResponse>>({
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
     * @default '2.5rem'
     */
    readonly $dataRowHeight = input<string>('2.5rem', {
        alias: 'dataRowHeight',
    });

    /**
     * The margin for all header cells
     * @default '0.5rem'
     */
    readonly $headerPadding = input<string>('0.5rem', {
        alias: 'headerPadding',
    });

    /**
     * The margin for all data cells
     * @default '0 0.5rem'
     */
    readonly $dataPadding = input<string>('0 0.5rem', {
        alias: 'dataPadding',
    });

    /**
     * The sorting mode. When multi sort is enabled, holding SHIFT when clicking a column header will add it to the sort list
     * @default single
     */
    readonly $sortMode = input<'single' | 'multi'>('single', {
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
    readonly $noDataTemplate = input<TemplateRef<any> | 'default'>('default', {
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

    protected readonly $columnWidthDirectives = viewChildren(ColRenderedWidthDirective);
    private hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
    private cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
    private readonly $headerRow = viewChild.required<ElementRef<HTMLElement>>('headerRow');
    private readonly $dataRowSizer = viewChild.required<ElementRef<HTMLElement>>('dataSizer');

    private readonly $dataWindowHeightPx = signal<number | undefined>(undefined, {
        equal: (a, b) => a === b,
    });
    private dataWindowHeightObserver: ResizeObserver | undefined;
    private readonly $dataRowHeightPx = signal<number | undefined>(undefined, {
        equal: (a, b) => a === b,
    });
    private dataRowHeightObserver: ResizeObserver | undefined;
    protected readonly dataManager = new DataManager(this.cdr);
    ngAfterViewInit(): void {
        const host = this.hostElement.nativeElement;

        if (this.$resetOnSizeChange()) {
            // data window height observer tends to flicker when the table is resized, so we cache the last 2 values
            // if it jumps back and forth, we ignore the resize event
            const last2DataWindowHeights: number[] = [0, 0];
            this.dataWindowHeightObserver = new ResizeObserver(() => {
                const dataWindowHeight = host.offsetHeight - this.$headerRow().nativeElement.offsetHeight - 15;
                if (last2DataWindowHeights.includes(dataWindowHeight)) {
                    // we are flickering the resize observer, so we ignore this call
                    return;
                }
                last2DataWindowHeights.shift();
                last2DataWindowHeights.push(dataWindowHeight);

                this.$dataWindowHeightPx.set(dataWindowHeight);
            });
            this.dataWindowHeightObserver.observe(host);
        } else {
            const dataWindowHeight = host.offsetHeight - this.$headerRow().nativeElement.offsetHeight;
            this.$dataWindowHeightPx.set(dataWindowHeight);
        }

        this.dataRowHeightObserver = new ResizeObserver(() => {
            this.$dataRowHeightPx.set(this.$dataRowSizer().nativeElement.offsetHeight);
        });
        this.dataRowHeightObserver.observe(this.$dataRowSizer().nativeElement);
    }

    private readonly dataManagerReset = effect(() => {
        const dataWindowHeight = this.$dataWindowHeightPx();
        const dataRowHeight = this.$dataRowHeightPx();
        const sort = this.$sort();
        const getDataBlock = this.$getDataBlock();
        const dataBlockWindow = this.$dataBlockWindow();
        const displayedColumns = this.$displayedColumnDefs();

        // this.hostElement.nativeElement.scrollTo({
        //     top: 0,
        //     left: 0,
        //     behavior: 'auto',
        // });
        untracked(() => this.resetInternal(dataWindowHeight, dataRowHeight, sort, getDataBlock, dataBlockWindow, displayedColumns));
    });

    @HostListener('scroll', ['$event.target'])
    private onScroll(element: HTMLElement) {
        this.dataManager.setScrollPosition(element.scrollTop);
    }
    ngOnDestroy(): void {
        if (this.dataWindowHeightObserver) {
            this.dataWindowHeightObserver.disconnect();
            this.dataWindowHeightObserver = undefined;
        }
        if (this.dataRowHeightObserver) {
            this.dataRowHeightObserver.disconnect();
            this.dataRowHeightObserver = undefined;
        }
    }

    protected onColumnHeaderClick(e: MouseEvent, def: ColumnDefDirective) {
        if (!def.$sortable()) {
            return;
        }
        console.log('Column header clicked', def.$id());
        e.preventDefault();
        e.stopPropagation();
        (e.target as HTMLElement).blur();

        const propertyName = def.$propertyName() || def.$id();
        const sort = this.$sort();
        const sortOrder = def.$sortOrder();
        const currentSort = sort.find((e) => e.property === propertyName);
        if (this.$sortMode() === 'single' || e.shiftKey === false) {
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
                        this.$sort.set(sort.filter((e) => e.property !== propertyName));
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

    private resetInternal(
        dataWindowHeight: number | undefined,
        dataRowHeight: number | undefined,
        sort: DataSort[] | undefined,
        getDataBlock: ((req: DataRequest) => Promise<DataResponse>) | undefined,
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
    ): boolean {
        if (!dataRowHeight || !dataWindowHeight || !sort || !getDataBlock || !displayedColumns) {
            console.warn('Table reset called with undefined parameters, ignoring');
            return false;
        }
        this.dataManager.reset(
            dataWindowHeight,
            dataRowHeight,
            sort,
            displayedColumns.map((e) => e.id),
            dataBlockWindow,
            getDataBlock,
        );
        return true;
    }
    reset(resetSort: boolean = false) {
        if (resetSort) {
            this.$sort.set([]);
        }
        const dataWindowHeight = this.$dataWindowHeightPx();
        const dataRowHeight = this.$dataRowHeightPx();
        const sort = this.$sort();
        const getDataBlock = this.$getDataBlock();
        const dataBlockWindow = this.$dataBlockWindow();
        const displayedColumns = this.$displayedColumnDefs();
        if (this.resetInternal(dataWindowHeight, dataRowHeight, sort, getDataBlock, dataBlockWindow, displayedColumns)) {
            console.log('Table reset successfully');
        }
    }
}
