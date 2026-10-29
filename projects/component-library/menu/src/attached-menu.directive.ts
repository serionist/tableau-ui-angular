import { computed, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { ButtonMenuDirective } from './button-menu.directive';
import type { MenuDirective } from './menu.directive';

@Directive({
  selector: '[attachedMenu]',
  standalone: false,
  // The element says whether its popup is open; one that opens a button menu, of menu items, is a menu button
  host: {
    '[attr.aria-haspopup]': '$popup()',
    '[attr.aria-expanded]': '$menu().$openDialog() !== undefined',
    '(click)': 'onClick()',
  },
})
export class AttachedMenuDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  /**
   * The menu that is attached to this directive.
   */
  readonly $menu = input.required<MenuDirective>({
    alias: 'attachedMenu',
  });

  readonly $autoOpenClose = input(true, {
    alias: 'autoOpenClose',
  });

  protected readonly $popup = computed(() => (this.$menu() instanceof ButtonMenuDirective ? 'menu' : null));

  private readonly menuChanged = effect(() => {
    this.$menu().$parentControl.set(this.el);
  });

  // Read on each click, so autoOpenClose can be turned off and on again
  protected onClick() {
    if (this.$autoOpenClose()) {
      this.$menu().open();
    }
  }
}
