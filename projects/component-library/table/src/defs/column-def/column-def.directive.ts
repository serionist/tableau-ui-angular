import type { TemplateRef } from '@angular/core';
import { contentChild, Directive, input, signal } from '@angular/core';
import { CellDefDirective } from '../cell-def/cell-def.directive';
import { HeaderDefDirective } from '../header-def/header-def.directive';
import type { HeaderContext } from '../header-def/header-context';
import type { CellContext } from '../cell-def/cell-context';
import type { DataSort } from '../../sorting/data-sort';
import { HeaderToolipDefDirective } from '../header-def/header-toolip-def.directive';
import { CellToolipDefDirective } from '../cell-def/cell-toolip-def.directive';

@Directive({
    selector: '[tabColumnDef]',
    standalone: false,
})
export class ColumnDefDirective<TData> {
    /**
     * The unique identifier for the column.
     */
    readonly $id = input.required<string>({
        alias: 'tabColumnDef',
    });

    /**
     * The property name of the column, used for sorting purposes.
     * If not provided, it will default to the column ID.
     * @default undefined
     */
    readonly $propertyName = input<string | undefined>(undefined, {
        alias: 'propertyName',
    });

    /**
     * The CSS width of the column.
     * Can be a string representing a CSS value (e.g., '100px', '20%', '1rem') or a number repesenting flex-grow (fill space).
     * @default "1"
     */
    readonly $width = input<number | string>(1, {
        alias: 'width',
    });

    /**
     * The CSS minimum width of the column.
     * Can be a string representing a CSS value (e.g., '100px', '20%', '1rem'). If no unit is provided, it will be treated as pixels.
     * @default "100px"
     */
    readonly $minWidth = input<string>('5rem', {
        alias: 'minWidth',
    });

    /**
     * The CSS maximum width of the column.
     * Can be a string representing a CSS value (e.g., '100px', '20%', '1rem'). If no unit is provided, it will be treated as pixels.
     * If undefined, there is no maximum width.
     * @default undefined
     */
    readonly $maxWidth = input<string | undefined>(undefined, {
        alias: 'maxWidth',
    });

    /**
     * Whether the column is resizable by the user.
     * @default true
     */
    readonly $resizable = input<boolean>(true, {
        alias: 'resizable',
    });

    /**
     * Whether the column is sortable by the user.
     * @default true
     */
    readonly $sortable = input<boolean>(true, {
        alias: 'sortable',
    });

    /**
     * The sort order of the column when it is sorted.
     * Can be 'asc' for ascending, 'desc' for descending, or an array of two values to indicate the order of sorting.
     * @default "['asc', 'desc']"
     */
    readonly $sortOrder = input<SortOrderPair>(['asc', 'desc'], {
        alias: 'sortOrder',
    });

    /**
     * The CSS class to apply to the column header.
     * Can be a string or a function that returns a string based on the header context.
     * If undefined, no class will be applied.
     * @default undefined
     */
    readonly $headerClass = input<string | ((ctx: HeaderContext<TData>) => string | undefined) | undefined>(undefined, {
        alias: 'headerClass',
    });

    /**
     * The CSS class to apply to the column cells.
     * Can be a string or a function that returns a string based on the cell context.
     * If undefined, no class will be applied.
     * @default undefined
     */
    readonly $cellClass = input<string | ((ctx: CellContext<TData>) => string | undefined) | undefined>(undefined, {
        alias: 'cellClass',
    });

    /**
     * Show automatic header tooltip when no tabHeaderTooltipDef is provided on the column.
     * @default true
     */
    readonly $showAutoHeaderTooltip = input<boolean>(true, {
        alias: 'showAutoHeaderTooltip',
    });

    /**
     * Show automatic cell tooltip when no tabCellTooltipDef is provided on the column.
     * The auto cell tooltip displays the column value when it's clipped. Only works for tabCellDefs with $textClipping() enabled.
     * If the cell value is not clipped, no automatic tooltip will be shown.
     * When a tabCellTooltipDef overrides the automatic tooltip, this setting has no effect.
     * @default true
     */
    readonly $showAutoCellTooltip = input<boolean>(true, {
        alias: 'showAutoCellTooltip',
    });

    readonly $cell = contentChild.required(CellDefDirective);
    readonly $header = contentChild(HeaderDefDirective);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly $headerTooltip = contentChild<HeaderToolipDefDirective<TData, any>>(HeaderToolipDefDirective);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly $cellTooltip = contentChild<CellToolipDefDirective<TData, any>>(CellToolipDefDirective);

    public buildHeaderContext(index: number, first: boolean, last: boolean, even: boolean, odd: boolean, count: number): HeaderContext<TData> {
        return {
            columnDef: this,
            meta: {
                index,
                first,
                last,
                even,
                odd,
                count,
            },
        };
    }
    public buildCellContext(
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
    ): CellContext<TData> {
        return {
            row: value,
            meta: {
                columnDef: this,
                index: index,
                first: first,
                last: last,
                even: even,
                odd: odd,
                count: count,
                columnIndex: columnIndex,
                columnFirst: columnFirst,
                columnLast: columnLast,
                columnEven: columnEven,
                columnOdd: columnOdd,
                columnCount: columnCount,
            },
            maxRowCount,
            $isClamped: signal(false), // This will be set later by the table component if text clamping is enabled
        };
    }
}
export type SortOrderPair = ['asc', 'desc'] | ['desc', 'asc'];
export interface HeaderTooltipArgs<TData> {
    ctx: HeaderContext<TData>;
    template: TemplateRef<HeaderContext<TData>>;
    sortMode: 'multi' | 'single';
    sortable: boolean;
    sortOrder: SortOrderPair;
    currentSort: { info: DataSort; index: number } | undefined;
    allSorts: DataSort[];
}
export interface CellTooltipArgs<TData> {
    ctx: CellContext<TData>;
    template: TemplateRef<CellContext<TData>>;
}
