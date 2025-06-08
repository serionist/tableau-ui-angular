import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import type { MenuComponent } from './menu.component';

@Directive({
    selector: '[menu]',
    standalone: false,
})
export class MenuDirective {
    readonly $menu = input.required<MenuComponent>({
        alias: 'menu',
    });
    private readonly el = inject(ElementRef);

    private readonly menuChanged = effect(() => {
        this.$menu().$parentControl.set(this.el);
    });
}
