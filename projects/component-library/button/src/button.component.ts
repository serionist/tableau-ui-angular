import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';

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
    // `disabled` means nothing on an <a>, so a screen reader would read it as enabled
    '[attr.aria-disabled]': 'isLink && ($disabled() || $loading()) ? "true" : null',
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
  protected readonly isLink = this.$nativeElement.nativeElement.tagName === 'A';

  constructor() {
    // A disabled <button> gets no click; an <a> does, from a screen reader or its keys, so it stops here, in the
    // capture phase, before any (click) of the app's on the element
    const unlisten = inject(Renderer2).listen(
      this.$nativeElement.nativeElement,
      'click',
      (event: Event) => {
        if (this.isLink && (this.$disabled() || this.$loading())) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
    inject(DestroyRef).onDestroy(unlisten);
  }
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
  @HostListener('keydown', ['$any($event)'])
  handleKeydown(event: KeyboardEvent) {
    const el = this.$nativeElement.nativeElement;
    this.clickFromKeyboard = true; // set flag to indicate click from keyboard
    if ((this.isLink && event.code === 'Enter') || event.code === 'Space') {
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
    if (this.$noFocusOnClick()) {
      // Prevent focus on click if $noFocusOnClick is true
      setTimeout(() => {
        this.$nativeElement.nativeElement.blur();
      });
    }
  }
}
