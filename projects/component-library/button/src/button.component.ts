import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input } from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'button:not([tab-menu-button]),a[button]:not([tab-menu-button])',
    standalone: false,
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
})
export class ButtonComponent {
    readonly $nativeElement = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly $disabled = input(false, {
        alias: 'disabled',
    });
    readonly $loading = input(false, {
        alias: 'loading',
    });
    readonly $tabindex = input('0', {
        alias: 'tabindex',
    });
    readonly $type = input<'button' | 'submit'>('button', {
        alias: 'type',
    });
    readonly $color = input<'error' | 'plain' | 'primary' | 'secondary'>('secondary', {
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
