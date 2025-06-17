import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { TableComponent } from '../../table.component';
import type { HeaderContext, HeaderTooltipContext } from './header-context';
import type { Primitive } from 'tableau-ui-angular/types';

@Directive({
    selector: '[tabHeaderTooltipDef]',
    standalone: false,
})
export class HeaderToolipDefDirective<TData, TKey extends Primitive> {
    readonly table = input.required<TableComponent<TData, TKey>>({
        alias: 'tabHeaderTooltipDef',
    });

    readonly $showTooltip = input<boolean | ((ctx: HeaderContext<TData, TKey>) => boolean)>(true, {
        alias: 'showTooltip',
    });

    readonly $tooltipPosition = input<'bottom' | 'left' | 'right' | 'top'>('top', {
        alias: 'tooltipPosition',
    });
    readonly $tooltipMargin = input<string>('0px', {
        alias: 'tooltipMargin',
    });

    public templateRef = inject(TemplateRef<{ $implicit: HeaderTooltipContext<TData, TKey> }>);

    static ngTemplateContextGuard<TData, TKey extends Primitive>(dir: HeaderToolipDefDirective<TData, TKey>, ctx: unknown): ctx is { $implicit: HeaderTooltipContext<TData, TKey> } {
        return true;
    }
}
