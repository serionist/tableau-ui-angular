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
        '[class]': '`${$color()} ${$kind()}`',
        '[attr.disabled]': '$disabled() || $loading() ? true : null',
        '[class.loading]': '$loading()',
        '[attr.tabindex]': '$disabled() ? "-1": $tabindex()',
        role: 'button',
        '[attr.layout]': '$layout()',
        '[attr.inline]': '$inline()',
        '(click)': 'mouseClickHandler()',
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

    readonly $kind = input<'stroked' | 'raised'>('stroked', {
        alias: 'kind',
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

    readonly $noFocusOnClick = input(true, {
        alias: 'noFocusOnClick',
    });

    private clickFromKeyboard = false;
    @HostListener('keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        const el = this.$nativeElement.nativeElement;
        this.clickFromKeyboard = true; // set flag to indicate click from keyboard
        if (el instanceof HTMLLinkElement && event.code === 'Enter' || event.code === 'Space') {
            console.log('Keydown event:', event.code, 'on element:', el);
            event.preventDefault(); // stop scroll or native behavior
            
            el.click(); // trigger click manually
        }
    }

    @HostListener('mousedown')
    handleMouseDown() {
        this.clickFromKeyboard = false; // reset flag on mouse down
    }

    @HostListener('pointerdown')
    handlePointerDown() {
        this.clickFromKeyboard = false; // reset flag on pointer down
    }

    @HostListener('touchstart')
    handleTouchStart() {
        this.clickFromKeyboard = false; // reset flag on touch start
    }

    mouseClickHandler() {
        if (this.clickFromKeyboard) {
            this.clickFromKeyboard = false; // reset flag after click
            return;
        }
        console.log('Button clicked:', this.$nativeElement.nativeElement, this.$noFocusOnClick(), this.$color());
        if (this.$noFocusOnClick()) {
            // Prevent focus on click if $noFocusOnClick is true
            console.log('Button clicked, but no focus will be set.');
            setTimeout(() => {
                this.$nativeElement.nativeElement.blur();
            });
        }
    }
}
