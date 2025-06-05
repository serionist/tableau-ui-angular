import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    effect,
    ElementRef,
    inject,
    input,
    model,
    OnDestroy,
    resource,
    ResourceLoader,
    ResourceLoaderParams,
    signal,
    viewChild,
    viewChildren,
} from '@angular/core';
import { ColumnDefDirective } from './defs/column-def/column-def.directive';
import { DataSort } from './sorting/data-sort';
import { ColRenderedWidthDirective } from './column-widths/col-rendered-width.directive';
import { DataManager } from './data/data-manager';
import { DataRequest } from './data/data-request';


@Component({
    selector: 'tab-table',
    standalone: false,
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {},
})
export class TableComponent implements AfterViewInit, OnDestroy {


    // replace with dynamic datasource later
    readonly data = input.required<Record<string, unknown>[]>();

    /**
     * The unique identified of each row model in the table.
     * This is used to track changes in the table and to identify rows uniquely.
     * If undefined, the table will use the index of the row as the unique identifier.
     * @default undefined
     */
    readonly idField = input.required<string | undefined>();
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
    readonly getDataBlock = input.required<(req: DataRequest) => Record<string, unknown>[] | Error>();

    /**
     * The margin for all header cells
     * @default '0.5rem'
     */
    readonly headerMargin = input<string>('0.5rem');

    /**
     * The margin for all data cells
     * @default '0 0.5rem'
     */
    readonly dataMargin = input<string>('0 0.5rem');

    /**
     * The height of the table data row.
     * This must be a valid CSS value.
     * Fixed height is required for virtual scrolling to work properly.
     * If the height is not fixed, the table will not be able to calculate the row heights and will not be able to scroll properly.
     * @default '2.5rem'
     */
    readonly dataRowHeight = input<string>('2.5rem');
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
    });

    protected readonly columnWidthDirectives = viewChildren(ColRenderedWidthDirective);
    private hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
    private headerRow = viewChild.required<ElementRef<HTMLElement>>('headerRow');
    private dataRowSizer = viewChild.required<ElementRef<HTMLElement>>('dataSizer');

    private dataWindowHeightPx = signal<number | undefined>(undefined);
    private dataWindowHeightObserver: ResizeObserver | undefined;
    private dataRowHeightPx = signal<number | undefined>(undefined);
    private dataRowHeightObserver: ResizeObserver | undefined;
    protected readonly dataManager = new DataManager();
    ngAfterViewInit(): void {
        const host = this.hostElement.nativeElement;
        this.dataWindowHeightObserver = new ResizeObserver(() => {
            this.dataWindowHeightPx.set(host.clientHeight - this.headerRow().nativeElement.clientHeight);
        });
        this.dataWindowHeightObserver.observe(host);

        this.dataRowHeightObserver = new ResizeObserver(() => {
            this.dataRowHeightPx.set(this.dataRowSizer().nativeElement.clientHeight);
        });
        this.dataRowHeightObserver.observe(host);

    }

    private readonly dataManagerReset = effect(() => {
        const dataWindowHeight = this.dataWindowHeightPx();
        const dataRowHeight = this.dataRowHeightPx();
        const sort = this.sort();
        const getDataBlock = this.getDataBlock();
        if (!dataRowHeight || !dataWindowHeight || !sort || !getDataBlock) {
            return;
        }
        this.dataManager.reset(dataWindowHeight, dataRowHeight, sort, getDataBlock);
    });


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





}
