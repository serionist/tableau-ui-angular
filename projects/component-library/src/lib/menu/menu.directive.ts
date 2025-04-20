import { Directive, effect, ElementRef, inject, input } from "@angular/core";
import { MenuComponent } from "./menu.component";

@Directive({
    selector: '[menu]',
    standalone: false
})
export class MenuDirective {
    readonly menu = input.required<MenuComponent>();
    readonly el = inject(ElementRef);
    constructor() {
        effect(() => {
            this.menu().parentControl.set(this.el);
        });
    }
}