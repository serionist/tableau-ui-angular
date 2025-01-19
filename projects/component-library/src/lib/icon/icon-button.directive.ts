import { ChangeDetectionStrategy, Directive, input } from '@angular/core';

@Directive({
    selector: 'tab-icon[iconButton]',
    host: {
        role: 'button',
        class: 'icon-button',
        '[attr.disabled]': 'disabled() ? true : null',
        '[attr.type]': 'type()',
        '[class]': 'color()',
        '[attr.tabindex]': 'disabled() ? "-1": tabindex()',
    },
    standalone: false,
})
export class IconButtonDirective {
    disabled = input(false);
    tabindex = input('0');
    type = input<'submit' | 'button'>('button');
    color = input<'primary' | 'secondary' | 'error'>('secondary');
    

}
