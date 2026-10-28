import { Directive, inject, input, TemplateRef } from '@angular/core';
import type { ChipControlComponent } from '../components/chip-control.component';
import type { ChipContext } from '../models/chip-context';

@Directive({
  selector: '[tabChipTemplate]',
  standalone: false,
})
export class ChipTemplateDirective<TKey, TValue> {
  readonly container = input.required<ChipControlComponent<TKey, TValue>>({
    alias: 'tabChipTemplate',
  });

  public templateRef = inject<TemplateRef<{ $implicit: ChipContext<TKey, TValue> }>>(TemplateRef<{ $implicit: ChipContext<TKey, TValue> }>);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular's guard signature; ctx is used by its type predicate
  static ngTemplateContextGuard<TKey, TValue>(dir: ChipTemplateDirective<TKey, TValue>, ctx: unknown): ctx is { $implicit: ChipContext<TKey, TValue> } {
    return true;
  }
}
