import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { TableComponent } from '../../table.component';
import type { Primitive } from 'tableau-ui-angular/types';
import type { CellContext, CellTooltipContext } from './cell-context';

@Directive({
    selector: '[tabCellTooltipDef]',
    standalone: false,
})
export class CellToolipDefDirective<TData, TKey extends Primitive> {
    readonly table = input.required<TableComponent<TData, TKey>>({
        alias: 'tabCellTooltipDef',
    });

    readonly $showTooltip = input<boolean | ((ctx: CellContext<TData>) => boolean)>(true, {
        alias: 'showTooltip',
    });

    readonly $tooltipPosition = input<'bottom' | 'left' | 'right' | 'top'>('bottom', {
        alias: 'tooltipPosition',
    });
    readonly $tooltipMargin = input<string>('0px', {
        alias: 'tooltipMargin',
    });

    readonly templateRef = inject(TemplateRef<{ $implicit: CellTooltipContext<TData> }>);

    static ngTemplateContextGuard<TData, TKey extends Primitive>(dir: CellToolipDefDirective<TData, TKey>, ctx: unknown): ctx is { $implicit: CellTooltipContext<TData> } {
        return true;
    }
}
