import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { VirtualizeComponent } from '../virtualize.component';
import type { ItemContext } from './item-context';

@Directive({
  selector: '[tabItemTemplate]',
  standalone: false,
})
export class ItemTemplateDirective<TData> {
  readonly container = input.required<VirtualizeComponent<TData>>({
    alias: 'tabItemTemplate',
  });
  public templateRef = inject<TemplateRef<{ $implicit: ItemContext<TData> }>>(TemplateRef<{ $implicit: ItemContext<TData> }>);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular's guard signature; ctx is used by its type predicate
  static ngTemplateContextGuard<TData>(dir: ItemTemplateDirective<TData>, ctx: unknown): ctx is { $implicit: ItemContext<TData> } {
    return true;
  }
}
