import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    inject,
    input,
    output,
    signal,
    ViewEncapsulation,
} from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'button:not([tab-menu-button]),a[button]:not([tab-menu-button])',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    host: {
        '[attr.type]': '$type()',
        '[class]': '$color()',
        '[attr.disabled]': '$disabled() || $loading() ? true : null',
        '[class.loading]': '$loading()',
        '[attr.tabindex]': '$disabled() ? "-1": $tabindex()',
        role: 'button',
        '[attr.layout]': '$layout()',
        '[attr.inline]': '$inline()',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class ButtonComponent {
    readonly $nativeElement = inject(ElementRef);
    readonly $disabled = input(false, {
        alias: 'disabled'
    });
    readonly $loading = input(false, {
        alias: 'loading'
    });
    readonly $tabindex = input('0', {
        alias: 'tabindex'
    });
    readonly $type = input<'submit' | 'button'>('button', {
        alias: 'type'
    });
    readonly $color = input<'primary' | 'secondary' | 'error' | 'plain'>('secondary', {
        alias: 'color',
    });
    readonly $layout = input<'default' | 'icon' | 'small-icon'>('default', {
        alias: 'layout',
    });
    readonly $inline = input(false, {
        alias: 'inline',
    });

    @HostListener('keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        const el = this.$nativeElement.nativeElement;

        if (event.code === 'Enter' || event.code === 'Space') {
          event.preventDefault(); // stop scroll or native behavior
          el.click(); // trigger click manually
      }
    }
}
