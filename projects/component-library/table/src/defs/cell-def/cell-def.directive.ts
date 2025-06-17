import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { CellContext } from './cell-context';
import type { Primitive } from 'tableau-ui-angular/types';
import type { TableComponent } from '../../table.component';

@Directive({
    selector: '[tabCellDef]',
    standalone: false,
})
export class CellDefDirective<TData, TKey extends Primitive> {
    readonly table = input.required<TableComponent<TData, TKey>>({
        alias: 'tabCellDef',
    });
    /**
     * When true, it will clamp the text content in the template to fit the cell height.
     * It will add an ellipsis (...) to the end of the text if it overflows.
     * This is useful for preventing overflow in table cells.
     * This will clamp to the maximum number of lines that can fit in the cell, respecting the height and padding of the cell.
     * It will also show a default tooltip with the full value of the cell uinless its turned off.
     * Only works if the cell template ONLY contains text, no HTML elements.
     * @default true
     */
    readonly $textClamping = input<boolean>(true, {
        alias: 'textClamping',
    });

    public templateRef = inject<TemplateRef<{ $implicit: CellContext<TData, TKey> }>>(TemplateRef<{ $implicit: CellContext<TData, TKey> }>);

    static ngTemplateContextGuard<TData, TKey extends Primitive>(dir: CellDefDirective<TData, TKey>, ctx: unknown): ctx is { $implicit: CellContext<TData, TKey> } {
        return true;
    }
}
