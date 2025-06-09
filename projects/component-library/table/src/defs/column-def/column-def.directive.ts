import type { TemplateRef } from '@angular/core';
import { contentChild, Directive, input } from '@angular/core';
import { CellDefDirective } from '../cell-def/cell-def.directive';
import { HeaderDefDirective } from '../header-def/header-def.directive';
import type { HeaderContext } from '../header-def/header-context';
import type { CellContext } from '../cell-def/cell-context';
import type { DataSort } from '../../sorting/data-sort';

@Directive({
    selector: '[tabColumnDef]',
    standalone: false,
})
export class ColumnDefDirective {
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
    readonly $headerClass = input<string | ((ctx: HeaderContext) => string | undefined) | undefined>(undefined, {
        alias: 'headerClass',
    });

    /**
     * The CSS class to apply to the column cells.
     * Can be a string or a function that returns a string based on the cell context.
     * If undefined, no class will be applied.
     * @default undefined
     */
    readonly $cellClass = input<string | ((ctx: CellContext) => string | undefined) | undefined>(undefined, {
        alias: 'cellClass',
    });

    /**
     * The tooltip for the column header.
     * It can be a string, a TemplateRef, or 'default' to use the default tooltip.
     * If 'default', it will show the column name and sort information.
     * If a TemplateRef is provided, it will be used to render the tooltip with HeaderTooltipArgs as a context.
     * If undefined, no tooltip will be shown.
     * @default 'default'
     */
    readonly $headerTooltip = input<TemplateRef<HeaderTooltipArgs> | string | 'default' | undefined>('default', {
        alias: 'headerTooltip',
    });

    /**
     * The tooltip for the column cells.
     * It can be a string or a TemplateRef.
     * If a TemplateRef is provided, it will be used to render the tooltip with CellContext as a context.
     * If undefined, no tooltip will be shown.
     * @default undefined
     */
    readonly $cellTooltip = input<TemplateRef<CellTooltipArgs> | undefined>(undefined, {
        alias: 'cellTooltip',
    });

    readonly $cell = contentChild.required(CellDefDirective);
    readonly $header = contentChild(HeaderDefDirective);
}
export type SortOrderPair = ['asc', 'desc'] | ['desc', 'asc'];
export interface HeaderTooltipArgs {
    ctx: HeaderContext;
    template: TemplateRef<HeaderContext>;
    sortMode: 'multi' | 'single';
    sortable: boolean;
    sortOrder: SortOrderPair;
    currentSort: { info: DataSort; index: number } | undefined;
    allSorts: DataSort[];
}
export interface CellTooltipArgs {
    ctx: CellContext;
    template: TemplateRef<CellContext>;
}
