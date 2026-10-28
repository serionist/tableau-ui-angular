import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { HeaderContext } from './header-context';
import type { TableComponent } from '../../table.component';

@Directive({
  selector: '[tabHeaderDef]',
  standalone: false,
})
export class HeaderDefDirective<TData> {
  readonly table = input.required<TableComponent<TData>>({
    alias: 'tabHeaderDef',
  });

  public templateRef = inject<TemplateRef<{ $implicit: HeaderContext<TData> }>>(TemplateRef<{ $implicit: HeaderContext<TData> }>);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular's guard signature; ctx is used by its type predicate
  static ngTemplateContextGuard<TData>(dir: HeaderDefDirective<TData>, ctx: unknown): ctx is { $implicit: HeaderContext<TData> } {
    return true;
  }
}
