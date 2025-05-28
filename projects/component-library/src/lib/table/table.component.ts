import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    input,
    model,
} from '@angular/core';
import { ColumnDefDirective } from './column-def/column-def.directive';

@Component({
    selector: 'tab-table',
    standalone: false,
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {},
})
export class TableComponent {
    // replace with dynamic datasource later
    readonly data = input.required<Record<string, unknown>[]>();

    /**
     * The unique identified of each row model in the table.
     * This is used to track changes in the table and to identify rows uniquely.
     * If undefined, the table will use the index of the row as the unique identifier.
     * @default undefined
     */
    readonly idField = input<string | undefined>(undefined);
    /**
     * The column IDs to display in the table. The order of the IDs determines the order of the columns.
     * If undefined, all columns will be displayed in the order they are defined in the table.
     * Users can show/hide columns dynamically from a built-in control, in which case, this changes
     * @default undefined
     */
    readonly displayedColumns = model<string[] | undefined>(undefined);

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
}
