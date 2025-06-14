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

    public templateRef = inject(TemplateRef<{ $implicit: CellContext<TData> }>);

    static ngTemplateContextGuard<TData, TKey extends Primitive>(dir: CellDefDirective<TData, TKey>, ctx: unknown): ctx is { $implicit: CellContext<TData> } {
        return true;
    }
}
