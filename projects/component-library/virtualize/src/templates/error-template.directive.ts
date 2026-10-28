import { Directive, inject, TemplateRef } from '@angular/core';
import type { ItemMetaContext } from './item-context';

@Directive({
  selector: '[tabItemErrorTemplate]',
  standalone: false,
})
export class ErrorTemplateDirective {
  public templateRef = inject<TemplateRef<{ $implicit: ItemMetaContext }>>(TemplateRef<{ $implicit: ItemMetaContext }>);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular's guard signature; ctx is used by its type predicate
  static ngTemplateContextGuard(dir: ItemMetaContext, ctx: unknown): ctx is { $implicit: ItemMetaContext } {
    return true;
  }
}
