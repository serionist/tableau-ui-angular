import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { HeaderContext } from './header-context';
import type { Primitive } from 'tableau-ui-angular/types';
import type { TableComponent } from '../../table.component';

@Directive({
    selector: '[tabHeaderDef]',
    standalone: false,
})
export class HeaderDefDirective<TData, TKey extends Primitive> {
    readonly table = input.required<TableComponent<TData, TKey>>({
        alias: 'tabHeaderDef',
    });

    public templateRef = inject<TemplateRef<{ $implicit: HeaderContext<TData, TKey> }>>(TemplateRef<{ $implicit: HeaderContext<TData, TKey> }>);

    static ngTemplateContextGuard<TData, TKey extends Primitive>(dir: HeaderDefDirective<TData, TKey>, ctx: unknown): ctx is { $implicit: HeaderContext<TData, TKey> } {
        return true;
    }
}
