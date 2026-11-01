import { isPlatformBrowser } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, contentChildren, DOCUMENT, effect, inject, Injector, PLATFORM_ID, untracked, viewChild } from '@angular/core';
import { DrawerComponent } from './drawer.component';

// What the container knows of a drawer: whether it was open when last seen, and the element focused when it opened
interface DrawerState {
  open: boolean;
  opener: HTMLElement | undefined;
}

/**
 * Holds the content and up to two drawers, one per side. A closed drawer is inert, so Tab skips it and screen readers
 * don't read it.
 *
 * Focus: the app moves focus into a drawer it opens once it renders, in `afterNextRender`, such as to its heading:
 * until then the drawer is still inert. A drawer that opens after its first render remembers the element focused
 * then, and when it closes with focus inside, focus goes back to that element while it is still in the page. A drawer
 * open from its first render has none, so the app moves focus when it closes that drawer.
 */
@Component({
  selector: 'tab-drawer-container',
  standalone: false,
  templateUrl: './drawer-container.component.html',
  styleUrl: './drawer-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerContainerComponent {
  private readonly $drawers = contentChildren(DrawerComponent);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly $leftWrapper = viewChild<ElementRef<HTMLElement>>('leftDrawerWrapper');
  private readonly $rightWrapper = viewChild<ElementRef<HTMLElement>>('rightDrawerWrapper');
  private readonly states = new WeakMap<DrawerComponent, DrawerState>();

  // A component's effect runs before its own template is checked, so a drawer that closes is not inert yet here and
  // the focus is still where it was
  private readonly focusFollows = effect(() => {
    const left = this.$leftDrawer();
    const right = this.$rightDrawer();
    const leftOpen = left?.$isOpen() ?? false;
    const rightOpen = right?.$isOpen() ?? false;
    untracked(() => {
      if (left) {
        this.follow(left, leftOpen, this.$leftWrapper()?.nativeElement);
      }
      if (right) {
        this.follow(right, rightOpen, this.$rightWrapper()?.nativeElement);
      }
    });
  });

  // Remembers the element focused when a drawer opens, and gives the focus back to it when the drawer closes with the
  // focus inside
  private follow(drawer: DrawerComponent, open: boolean, wrapper: HTMLElement | undefined) {
    const state = this.states.get(drawer);
    if (state === undefined) {
      // its first render: a drawer open from the start has no opener
      this.states.set(drawer, { open, opener: undefined });
      return;
    }
    if (state.open === open) {
      return;
    }
    state.open = open;
    if (!this.isBrowser) {
      return;
    }
    if (open) {
      const active = this.document.activeElement;
      state.opener = active instanceof HTMLElement && active !== this.document.body ? active : undefined;
      return;
    }
    const opener = state.opener;
    state.opener = undefined;
    if (opener === undefined || !this.holdsFocus(wrapper)) {
      return;
    }
    afterNextRender(
      () => {
        const active = this.document.activeElement;
        // the focus is still in the drawer, or lost as it became inert, unless the app has moved it already
        if (opener.isConnected && (active === null || active === this.document.body || this.holdsFocus(wrapper))) {
          opener.focus();
        }
      },
      { injector: this.injector },
    );
  }

  private holdsFocus(wrapper: HTMLElement | undefined): boolean {
    const active = this.document.activeElement;
    return wrapper !== undefined && active !== null && wrapper.contains(active);
  }

  private readonly drawersChanged = effect(() => {
    const drawers = this.$drawers();
    const leftDrawers = drawers.filter(e => e.$position() === 'left');
    const rightDrawers = drawers.filter(e => e.$position() === 'right');
    if (leftDrawers.length > 1) {
      throw new Error('There can only be one left drawer.');
    }
    if (rightDrawers.length > 1) {
      throw new Error('There can only be one right drawer.');
    }
  });
  readonly $leftDrawer = computed(() => this.$drawers().find(e => e.$position() === 'left'));
  readonly $rightDrawer = computed(() => this.$drawers().find(e => e.$position() === 'right'));

  readonly $rightDrawerPositionExpression = computed(() => {
    const rightDrawer = this.$rightDrawer();
    if (!rightDrawer) {
      return '0px';
    }
    const width = rightDrawer.$width();
    let padding = rightDrawer.$padding();
    // if padding is just a number, add px
    if (/^\d+$/.test(padding)) {
      padding += 'px';
    }
    const borderWidth = this.getBorderWidth(rightDrawer.$border()) ?? '0px';
    const ret = `${width} + (${padding} * 2) + ${borderWidth}`;
    return ret;
  });
  readonly $leftDrawerPositionExpression = computed(() => {
    const leftDrawer = this.$leftDrawer();
    if (!leftDrawer) {
      return '0px';
    }
    const width = leftDrawer.$width();
    let padding = leftDrawer.$padding();
    // if padding is just a number, add px
    if (/^\d+$/.test(padding)) {
      padding += 'px';
    }
    const borderWidth = this.getBorderWidth(leftDrawer.$border()) ?? '0px';
    const ret = `${width} + (${padding} * 2) + ${borderWidth}`;
    return ret;
  });

  private getBorderWidth(border: string): string | null {
    const parts = border.trim().split(/\s+/);
    const widthRegex = /^(\d+(\.\d+)?)(px|em|rem|%)$/;
    for (const part of parts) {
      if (widthRegex.test(part)) {
        return part;
      }
    }
    return null;
  }
}
