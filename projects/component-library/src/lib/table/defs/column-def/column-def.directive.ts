import { contentChild, Directive, input, signal } from '@angular/core';
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
     * The CSS width of the column.
     * Can be a string representing a CSS value (e.g., '100px', '20%', '1rem') or a number repesenting flex-grow (fill space).
     * @default "1"
     */
    readonly width = input<string | number>(1);

    /**
     * The CSS minimum width of the column.
     * Can be a string representing a CSS value (e.g., '100px', '20%', '1rem'). If no unit is provided, it will be treated as pixels.
     * @default "100px"
     */
    readonly minWidth = input<string>('5rem');

    /**
     * The CSS maximum width of the column.
     * Can be a string representing a CSS value (e.g., '100px', '20%', '1rem'). If no unit is provided, it will be treated as pixels.
     * If undefined, there is no maximum width.
     * @default undefined
     */
    readonly maxWidth = input<string | undefined>(undefined);

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
