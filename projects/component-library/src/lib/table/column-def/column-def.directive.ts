import { contentChild, Directive, input } from '@angular/core';
import { CellDefDirective } from '../cell-def/cell-def.directive';
import { HeaderDefDirective } from '../header-def/header-def.directive';
import { HeaderContext } from '../header-def/header-context';
import { CellContext } from '../cell-def/cell-context';

@Directive({
    selector: '[tabColumnDef]',
    standalone: false,
})
export class ColumnDefDirective {
    /**
     * The unique identifier for the column.
     */
    readonly id = input.required<string>({
        alias: 'tabColumnDef',
    });

    /**
     * The minimum CSS width of the column.
     * Can be undefined, in which case the column will not have a minimum width.
     * @default '1rem'
     */
    readonly minWidth = input<string | undefined>('1rem');

    /**
     * The maximum CSS width of the column.
     * Can be undefined, in which case the column will not have a maximum width.
     * @default undefined
     */
    readonly maxWidth = input<string | undefined>(undefined);

    /**
     * The CSS width of the column.
     * Can be undefined, in which case the column will behave as table layout dictates.
     * @default undefined
     */
    readonly width = input<string | undefined>(undefined);

    /**
     * Whether the column is resizable by the user.
     * @default true
     */
    readonly resizable = input<boolean>(true);

    /**
     * Whether the column is sortable by the user.
     * @default true
     */
    readonly sortable = input<boolean>(true);

    /**
     * The CSS class to apply to the column header.
     * Can be a string or a function that returns a string based on the header context.
     * If undefined, no class will be applied.
     * @default undefined
     */
    readonly headerClass = input<
        string | ((ctx: HeaderContext) => string | undefined) | undefined
    >(undefined);

    /**
     * The CSS class to apply to the column cells.
     * Can be a string or a function that returns a string based on the cell context.
     * If undefined, no class will be applied.
     * @default undefined
     */
    readonly cellClass = input<
        string | ((ctx: CellContext) => string | undefined) | undefined>(undefined);



    readonly cell = contentChild.required(CellDefDirective);
    readonly header = contentChild(HeaderDefDirective);
}
