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
    untracked,
    viewChild,
    viewChildren,
} from '@angular/core';
import { ColumnDefDirective } from './defs/column-def/column-def.directive';
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
     * Users can show/hide columns dynamically from a built-in control, in which case, this changes
     * @default undefined
     */
    readonly displayedColumns = model<string[] | undefined>(undefined);

    /**
     * The function to get a data block. Provides an offset, count, sort and an abortsignal
     * Handling abort is recommended, as many block requests may be fired that are canceled when the user scrolls fast
     */
    readonly getDataBlock =
        input.required<(req: DataRequest) => Promise<DataResponse>>();

    /**
     * The number of data blocks to load before and after the currently displayed block(s) based on scroll position.
     * This is used to determine how many blocks to load in advance for smooth scrolling.
     * A data block is a chunk of data that is loaded from the server. It's size is is whatever fits the current viewport.
     * @default 3
     */
    readonly dataBlockWindow = input<number>(3);

    /**
     * The height of the table data row.
     * This must be a valid CSS value.
     * Fixed height is required for virtual scrolling to work properly.
     * If the height is not fixed, the table will not be able to calculate the row heights and will not be able to scroll properly.
     * @default '2.5rem'
     */
    readonly dataRowHeight = input<string>('2.5rem');

    /**
     * The margin for all header cells
     * @default '0.5rem'
     */
    readonly headerPadding = input<string>('0.5rem');

    /**
     * The margin for all data cells
     * @default '0 0.5rem'
     */
    readonly dataPadding = input<string>('0 0.5rem');

    /**
     * The sorting mode. When multi sort is enabled, holding SHIFT when clicking a column header will add it to the sort list
     * @default single
     */
    readonly sortMode = input<'single' | 'multi'>('single');

    /**
     * The sort models. Initial sort mode can be provided here.
     * This gets updated when the sort is changed by the user on the UI dynamically
     * @default []
     */
    readonly sort = model<DataSort[]>([]);

    /**
     * The column ID to pin to the left side of the table.
     * If undefined, no column will be pinned to the left.
     * This can be changed dynamically by the user from a built-in control.
     * @default undefined
     */
    readonly pinnedLeftColumn = model<string | undefined>(undefined);

    /**
     * The column ID to pin to the right side of the table.
     * If undefined, no column will be pinned to the right.
     * This can be changed dynamically by the user from a built-in control.
     * @default undefined
     */
    readonly pinnedRightColumn = model<string | undefined>(undefined);

    private readonly columnDefs = contentChildren(ColumnDefDirective);
    protected readonly displayedColumnDefs = computed(() => {
        let columnDefs = this.columnDefs();
        const displayedColumns = this.displayedColumns();
        const pinnedLeftColumnId = this.pinnedLeftColumn();
        const pinnedRightColumnId = this.pinnedRightColumn();
        if (displayedColumns) {
            const displayColumnDefs = [];
            for (const colId of displayedColumns) {
                const colDef = columnDefs.find((e) => e.id() === colId);
                if (colDef) {
                    displayColumnDefs.push(colDef);
                }
            }
            columnDefs = displayColumnDefs;
        }
        const pinnedLeftColumn = columnDefs.find(
            (e) => e.id() === pinnedLeftColumnId
        );
        const pinnedRightColumn = columnDefs.find(
            (e) => e.id() === pinnedRightColumnId
        );

        const ret: {
            id: string;
            col: ColumnDefDirective;
            pinnedLeft: boolean;
            pinnedRight: boolean;
        }[] = [];
        if (pinnedLeftColumn) {
            ret.push({
                id: pinnedLeftColumn.id(),
                col: pinnedLeftColumn,
                pinnedLeft: true,
                pinnedRight: false,
            });
        }
        for (const col of columnDefs.filter(
            (e) => e !== pinnedLeftColumn && e !== pinnedRightColumn
        )) {
            ret.push({
                id: col.id(),
                col,
                pinnedLeft: false,
                pinnedRight: false,
            });
        }
        if (pinnedRightColumn) {
            ret.push({
                id: pinnedRightColumn.id(),
                col: pinnedRightColumn,
                pinnedLeft: false,
                pinnedRight: true,
            });
        }
        return ret;
    }, {
        equal: (a, b) => {
            if (a.length !== b.length) {
                return false;
                
            }
            for (let i = 0; i < a.length; i++) {
                if (
                    a[i].id !== b[i].id ||
                    a[i].pinnedLeft !== b[i].pinnedLeft ||
                    a[i].pinnedRight !== b[i].pinnedRight ||
                    a[i].col.id() !== b[i].col.id()
                ) {
                    return false;
                }
            }
            return true;
        }
    });

    protected readonly columnWidthDirectives = viewChildren(
        ColRenderedWidthDirective
    );
    private hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
    private cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
    private headerRow =
        viewChild.required<ElementRef<HTMLElement>>('headerRow');
    private dataRowSizer =
        viewChild.required<ElementRef<HTMLElement>>('dataSizer');

    private verticalScrollBarWidthPx = signal<number>(0, {
        equal: (a, b) => a === b
    });
    private dataWindowHeightPx = signal<number | undefined>(undefined, {
        equal: (a, b) => a === b
    });
    private dataWindowHeightObserver: ResizeObserver | undefined;
    private dataRowHeightPx = signal<number | undefined>(undefined, {
        equal: (a, b) => a === b
    });
    private dataRowHeightObserver: ResizeObserver | undefined;
    protected readonly dataManager = new DataManager(this.cdr);
    ngAfterViewInit(): void {
        const host = this.hostElement.nativeElement;
        this.dataWindowHeightObserver = new ResizeObserver(() => {
            this.dataWindowHeightPx.set(
                host.offsetHeight - this.headerRow().nativeElement.offsetHeight
            );
            this.verticalScrollBarWidthPx.set(
                host.offsetWidth - host.clientWidth
            );
        });
        this.dataWindowHeightObserver.observe(host);

        this.dataRowHeightObserver = new ResizeObserver(() => {
            this.dataRowHeightPx.set(
                this.dataRowSizer().nativeElement.offsetHeight
            );
        });
        this.dataRowHeightObserver.observe(host);
    }

    private a1 = effect(() => console.log('dataWindowHeightPx changed', this.dataWindowHeightPx()));
    private a2 = effect(() => console.log('dataRowHeightPx changed', this.dataRowHeightPx()));
    private a3 = effect(() => console.log('sort changed', this.sort()));
    private a4 = effect(() => console.log('getDataBlock changed', this.getDataBlock()));
    private a5 = effect(() => console.log('dataBlockWindow changed', this.dataBlockWindow()));
    private a6 = effect(() => console.log('displayedColumnDefs changed', this.displayedColumnDefs()));
    private readonly dataManagerReset = effect(() => {
        const dataWindowHeight = this.dataWindowHeightPx();
        const dataRowHeight = this.dataRowHeightPx();
        const sort = this.sort();
        const getDataBlock = this.getDataBlock();
        const dataBlockWindow =this.dataBlockWindow();
        const displayedColumns = this.displayedColumnDefs();
        if (
            !dataRowHeight ||
            !dataWindowHeight ||
            !sort ||
            !getDataBlock ||
            !displayedColumns
        ) {
            return;
        }
        // this.hostElement.nativeElement.scrollTo({
        //     top: 0,
        //     left: 0,
        //     behavior: 'auto',
        // });
        untracked(() =>
            this.dataManager.reset(
                dataWindowHeight,
                dataRowHeight,
                sort,
                displayedColumns.map(e => e.id),
                dataBlockWindow,
                getDataBlock
            )
        );
    });

    @HostListener('scroll', ['$event.target'])
    onScroll(element: HTMLElement) {
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

    onColumnHeaderClick(e: MouseEvent, def: ColumnDefDirective) {
        if (!def.sortable()) {
            return;
        }
        console.log('Column header clicked', def.id());
        e.preventDefault();
        e.stopPropagation();
        (e.target as HTMLElement).blur();
    }

    // reload() {

    // }
}
