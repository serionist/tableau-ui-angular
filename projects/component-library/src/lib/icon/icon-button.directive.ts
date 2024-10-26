import { Directive, input } from "@angular/core";

@Directive({
    selector: '[iconButton]',
    host: {
        "role": "button",
        "class": "icon-button",
        "[attr.disabled]": "disabled() ? true : null",
    }
})
export class IconButtonDirective { 
    disabled = input(false);
}