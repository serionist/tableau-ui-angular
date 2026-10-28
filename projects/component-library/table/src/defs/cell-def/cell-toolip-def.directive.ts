import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { TableComponent } from '../../table.component';
import type { CellContext, CellTooltipContext } from './cell-context';

@Directive({
  selector: '[tabCellTooltipDef]',
  standalone: false,
})
export class CellToolipDefDirective<TData> {
  readonly table = input.required<TableComponent<TData>>({
    alias: 'tabCellTooltipDef',
  });

  readonly $showTooltip = input<boolean | ((ctx: CellContext<TData>, isClamped: boolean) => boolean)>(true, {
    alias: 'showTooltip',
  });

  readonly $tooltipPosition = input<'bottom' | 'left' | 'right' | 'top'>('bottom', {
    alias: 'tooltipPosition',
  });
  readonly $tooltipMargin = input<string>('0px', {
    alias: 'tooltipMargin',
  });

  readonly templateRef = inject(TemplateRef<{ $implicit: CellTooltipContext<TData> }>);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular's guard signature; ctx is used by its type predicate
  static ngTemplateContextGuard<TData>(dir: CellToolipDefDirective<TData>, ctx: unknown): ctx is { $implicit: CellTooltipContext<TData> } {
    return true;
  }
}
