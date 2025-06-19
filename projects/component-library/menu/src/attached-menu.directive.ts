import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import type { MenuDirective } from './menu.directive';

@Directive({
  selector: '[attachedMenu]',
  standalone: false,
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

  private readonly menuChanged = effect(() => {
    this.$menu().$parentControl.set(this.el);
  });
  private readonly autoOpenCloseChanged = effect(() => {
    const autoOpenClose = this.$autoOpenClose();
    if (autoOpenClose) {
      this.el.nativeElement.addEventListener('click', this.clickAction.bind(this));
    } else {
      this.el.nativeElement.removeEventListener('click', this.clickAction.bind(this));
    }
  });

  private clickAction() {
    this.$menu().open();
  }
}
