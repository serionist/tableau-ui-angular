import type { AfterViewInit, InputSignal, OnDestroy, OutputRefSubscription, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChildren, effect, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { MenuButtonComponent } from './menu-button.component';
import { generateRandomString } from 'tableau-ui-angular/utils';
import { ButtonMenuDirective } from 'tableau-ui-angular/menu';

@Component({
  selector: 'tab-menu-button-group',
  standalone: false,
  template: `
    @for (entry of $menuGroupStack() | entries; track entry[1].id) {
      <!-- eslint-disable @angular-eslint/template/prefer-template-literal -->
      <div
        class="menu-group"
        resizeWatcher
        [id]="entry[1].id"
        [style.position]="entry[1].$position()"
        [style.top]="entry[1].$top() + 'px'"
        [style.left]="entry[1].$left() + 'px'"
        [style.minWidth]="entry[1].$minWidth()"
        (resized)="entry[1].element = $event.currentElement.nativeElement; updateSizes()"
      >
        @for (btnEntry of entry[1].buttons | entries; track btnEntry[0]) {
          <ng-container *ngTemplateOutlet="btnEntry[1].$template()" />
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        outline: none !important;
        position: relative;
        display: block;
        width: 100%;
        user-select: none;
      }
    `,
    `
      .menu-group {
        background: var(--twc-color-base);
        border-color: var(--twc-color-border-light);
        border-radius: var(--twc-menu-border-radius);
        border-style: solid;
        border-width: 1px;
        box-shadow: var(--twc-dialog-box-shadow);
        outline: none;

        color: var(--twc-color-text);
        line-height: normal;
        overflow-y: auto;
        overflow-x: hidden;
        user-select: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '0',
    '[style.minHeight]': '$height() + "px"',
    '[style.minWidth]': '$width() + "px"',
  },
})
export class MenuButtonGroupComponent implements OnDestroy, AfterViewInit {
  readonly nativeElement = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly menu = inject(ButtonMenuDirective, { optional: true });

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $hoverToOpenSubMenuMs: InputSignal<number | undefined> = input<number | undefined>(500, {
    alias: 'hoverToOpenSubMenuMs',
  });
  readonly buttonClicked = output<{
    button: MenuButtonComponent;
    event: Event;
  }>();

  protected readonly $children = contentChildren(MenuButtonComponent);
  private previousChildrenIds: string[] = [];
  readonly childrenEffect = effect(() => {
    const children = this.$children();
    const ids = children.map(c => c.id);
    const addedIds = ids.filter(id => !this.previousChildrenIds.includes(id));
    const removedIds = this.previousChildrenIds.filter(id => !ids.includes(id));
    if (!addedIds.length && !removedIds.length) {
      return;
    }
    this.previousChildrenIds = ids;

    const hoverMs = this.$hoverToOpenSubMenuMs();
    for (const child of children) {
      if (child.$hoverToOpenSubMenuMs() !== undefined) {
        child.$actualHoverMs.set(child.$hoverToOpenSubMenuMs());
      } else {
        child.$actualHoverMs.set(hoverMs);
      }
    }
    this.init();
  });
  readonly $menuGroupStack = signal<IMenuGroup[]>([], {
    equal: () => false,
  });

  private readonly $height = signal<number>(0);
  private readonly $width = signal<number>(0);

  private viewInitialized = false;
  private readonly subs: OutputRefSubscription[] = [];
  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.init();
    this.nativeElement.nativeElement.focus();
    this.subs.push(
      this.buttonClicked.subscribe(() => {
        this.menu?.close();
      }),
    );
  }
  init() {
    if (!this.viewInitialized) {
      return;
    }
    this.destroyGroupsUntil();
    void this.addMenuGroup();
    if (this.menu) {
      this.menu.opened.subscribe(() => {
        this.updateSizes();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyGroupsUntil();
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }

  addMenuGroup(parentButton?: MenuButtonComponent) {
    const children = parentButton?.$children() ?? this.$children();
    if (children.length === 0) {
      return undefined;
    }
    // if first item
    const group: IMenuGroup = {
      id: generateRandomString(),
      // position is fixed and off screen
      // this is used to calculate actual size of the menu group
      $top: signal(-10000),
      $left: signal(-10000),
      $minWidth: signal('auto'),
      element: null,
      $position: signal<'absolute' | 'fixed'>('fixed'),
      buttons: children,
      mouseoverSubscriptions: children.map(c =>
        c.mouseoverChange.subscribe(mouseOver => {
          for (const child of children) {
            child.$highlight.set(false);
          }
          if (mouseOver) {
            this.nativeElement.nativeElement.focus();
            c.$highlight.set(true);
          }
        }),
      ),
      openSubMenuSubscriptions: children
        .filter(e => e.$children().length > 0)
        .map(c =>
          c.openSubMenu.subscribe(() => {
            if (this.$menuGroupStack().some(s => s.parentButton?.id === c.id)) {
              return;
            }
            const g = this.addMenuGroup(c);
            const firstButton = g?.buttons.find(b => !b.$disabled());
            if (firstButton) {
              firstButton.$highlight.set(true);
            }
          }),
        ),
      clickSubscriptions: children.map(c =>
        c.click.subscribe(e => {
          const stack = this.$menuGroupStack();
          if (stack.length > 0) {
            const firstGroup = stack[0];
            this.destroyGroupsUntil(firstGroup.id);
          }
          this.buttonClicked.emit({
            button: c,
            event: e,
          });
        }),
      ),
      highlightSubscriptions: children.map(c =>
        c.highlightChange.subscribe(highlight => {
          if (highlight) {
            // if highlight changed in this group, make sure it's the last group in the list
            this.destroyGroupsUntil(group.id);
          }
        }),
      ),
      parentButton: parentButton?.id !== undefined ? document.getElementById(parentButton.id) : null,
    };
    this.$menuGroupStack.update(groups => {
      const newGroups = [...groups, group];
      return newGroups;
    });

    // wait for our new group to render (max 10 seconds)

    this.updateSizes();
    return group;
  }

  updateSizes() {
    const groups = this.$menuGroupStack();
    const currentRect = this.nativeElement.nativeElement.getBoundingClientRect();

    let minTop = 0;
    let minLeft = 0;
    let maxTop = 0;
    let maxLeft = 0;

    for (const group of groups) {
      if (!group.element) {
        continue;
      }
      const rect = group.element.getBoundingClientRect();
      const elWidth = rect.width;
      const elHeight = rect.height;
      let top: number;
      let left: number;
      let minWidth: string = 'auto';

      if (!group.parentButton) {
        top = 0;
        left = 0;
        group.$position.set('absolute');
        minTop = Math.min(minTop, 0);
        minLeft = Math.min(minLeft, 0);
        maxTop = Math.max(maxTop, elHeight);
        maxLeft = Math.max(maxLeft, elWidth);

        if (this.menu?.$minWidth() === 'parentWidth') {
          const parent = this.menu?.$parentControl()?.nativeElement;
          if (parent) {
            minWidth = `calc(${parent.getBoundingClientRect().width}px - 2px)`;
          }
        }
      } else {
        const parentRect = group.parentButton.getBoundingClientRect();
        top = parentRect.top - currentRect.top;
        minTop = Math.min(minTop, top);
        left = parentRect.right;
        if (left + rect.width > window.innerWidth) {
          left = parentRect.left - rect.width;
        }
        left = left - currentRect.left;
        minLeft = Math.min(minLeft, left);
        maxTop = Math.max(maxTop, top + elHeight);
        maxLeft = Math.max(maxLeft, left + elWidth);
        group.$position.set('absolute');
      }
      group.$top.set(top);
      group.$left.set(left);
      group.$minWidth.set(minWidth);
    }
    this.$height.set(maxTop - minTop);
    this.$width.set(maxLeft - minLeft);
  }

  destroyGroupsUntil(id?: string) {
    const groups = this.$menuGroupStack();

    const curIndex = groups.findIndex(g => g.id === id);

    const removed = groups.splice(curIndex + 1);
    for (const group of removed) {
      group.mouseoverSubscriptions.forEach(s => {
        s.unsubscribe();
      });
      group.openSubMenuSubscriptions.forEach(s => {
        s.unsubscribe();
      });
      group.highlightSubscriptions.forEach(s => {
        s.unsubscribe();
      });
      group.clickSubscriptions.forEach(s => {
        s.unsubscribe();
      });
      group.buttons.forEach(b => {
        b.$highlight.set(false);
      });
      // group.element?.remove();
    }
    // this will also remove from DOM
    this.$menuGroupStack.set(groups);
    this.updateSizes();
  }
  @HostListener('focusin')
  onFocusIn() {
    // clear everything except the first group in the stack
    const groupStack = this.$menuGroupStack().slice(0, 1);
    // highlight the first button in the group
    const firstButton = groupStack[0].buttons.find(b => !b.$disabled());
    if (firstButton) {
      firstButton.$highlight.set(true);
    }
  }

  @HostListener('focusout')
  onFocusOut() {
    // clear everything except the first group in the stack
    const groupStack = this.$menuGroupStack();
    if (groupStack.length > 0) {
      const rootId = groupStack[0].id;
      this.destroyGroupsUntil(rootId);
      for (const b of groupStack[0].buttons) {
        b.$highlight.set(false);
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // we only handle navitation on top of the stack
      const stack = this.$menuGroupStack();
      const buttons = stack[stack.length - 1]?.buttons;

      let currentIndex = -1;
      currentIndex = buttons.findIndex(child => child.$highlight());
      let nextIndex: number;
      if (event.key === 'ArrowDown') {
        if (currentIndex === -1) {
          // find the first non disabled option
          nextIndex = buttons.findIndex(e => !e.$disabled());
        } else {
          // find the next option that is not disabled
          nextIndex = buttons.findIndex((o, i) => i > currentIndex && !o.$disabled());
          // if no option is found, find the next option that is not disabled before the current item
          if (nextIndex === -1) {
            nextIndex = buttons.findIndex((o, i) => i < currentIndex && !o.$disabled());
          }
        }
      } else if (event.key === 'ArrowUp') {
        if (currentIndex === -1) {
          // find the last non disabled option
          nextIndex = buttons
            .slice()
            .reverse()
            .findIndex(o => !o.$disabled());
          if (nextIndex !== -1) {
            nextIndex = buttons.length - nextIndex - 1;
          }
        } else {
          const flippedCurrentIndex = buttons.length - currentIndex - 1;
          // find the next option that is not disabled
          nextIndex = [...buttons].reverse().findIndex((o, i) => i > flippedCurrentIndex && !o.$disabled());
          // if no option is found, find the next option that is not disabled before the current item
          if (nextIndex === -1) {
            nextIndex = [...buttons].reverse().findIndex((o, i) => i < flippedCurrentIndex && !o.$disabled());
          }
          if (nextIndex !== -1) {
            nextIndex = buttons.length - nextIndex - 1;
          }
        }
      } else {
        nextIndex = -1;
      }

      for (const [i, b] of buttons.entries()) {
        b.$highlight.set(i === nextIndex);
      }
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      const highlightedButton = this.$menuGroupStack()[this.$menuGroupStack().length - 1]?.buttons?.find(b => b.$highlight());
      if (!highlightedButton || highlightedButton.$disabled()) {
        return;
      }
      if (highlightedButton.$children().length > 0) {
        highlightedButton.onClick(event);
      } else if (event.key === 'Enter' || event.key === ' ') {
        highlightedButton.onClick(event);
      }
    }
    if (event.key === 'ArrowLeft') {
      if (this.$menuGroupStack().length > 1) {
        const parentGroupId = this.$menuGroupStack()[this.$menuGroupStack().length - 2].id;
        this.destroyGroupsUntil(parentGroupId);
      }
    }
  }
}

interface IMenuGroup {
  id: string;
  $top: WritableSignal<number>;
  $left: WritableSignal<number>;
  $position: WritableSignal<'absolute' | 'fixed'>;
  $minWidth: WritableSignal<string>;
  parentButton: HTMLElement | null;
  buttons: readonly MenuButtonComponent[];
  element: Element | null;
  mouseoverSubscriptions: OutputRefSubscription[];
  openSubMenuSubscriptions: OutputRefSubscription[];
  clickSubscriptions: OutputRefSubscription[];
  highlightSubscriptions: OutputRefSubscription[];
}
