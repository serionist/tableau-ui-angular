import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { TableComponent } from '../../table.component';
import type { HeaderContext, HeaderTooltipContext } from './header-context';

@Directive({
  selector: '[tabHeaderTooltipDef]',
  standalone: false,
})
export class HeaderToolipDefDirective<TData> {
  readonly table = input.required<TableComponent<TData>>({
    alias: 'tabHeaderTooltipDef',
  });

  readonly $showTooltip = input<boolean | ((ctx: HeaderContext<TData>) => boolean)>(true, {
    alias: 'showTooltip',
  });

  readonly $tooltipPosition = input<'bottom' | 'left' | 'right' | 'top'>('top', {
    alias: 'tooltipPosition',
  });
  readonly $tooltipMargin = input<string>('0px', {
    alias: 'tooltipMargin',
  });

  public templateRef = inject(TemplateRef<{ $implicit: HeaderTooltipContext<TData> }>);

  static ngTemplateContextGuard<TData>(dir: HeaderToolipDefDirective<TData>, ctx: unknown): ctx is { $implicit: HeaderTooltipContext<TData> } {
    return true;
  }
}
