import type { AfterContentChecked, Signal, InputSignal } from '@angular/core';
import { afterNextRender, Component, contentChildren, signal, computed, ChangeDetectionStrategy, ElementRef, inject, Injector, input, viewChild, viewChildren, output } from '@angular/core';
import { generateRandomString } from 'tableau-ui-angular/utils';
import { TabComponent } from './tab.component';

@Component({
  selector: 'tab-group',
  standalone: false,
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {},
})
export class TabGroupComponent implements AfterContentChecked {
  private readonly injector = inject(Injector);

  /**
   * Padding for the tab header, can be adjusted to fit design requirements.
   * @default '0.25rem 1.5rem'
   */
  readonly $headerPadding = input<string>('0.25rem 1.5rem', {
    alias: 'headerPadding',
  });

  /**
   * Size of the scroll arrows icon, can be adjusted to fit design requirements.
   * @default '1.5rem'
   */
  readonly $scrollArrowsIconSize = input<string>('1.5rem', {
    alias: 'scrollArrowsIconSize',
  });
  /**
   * Whether to automatically select the first non-disabled tab when the component is initialized.
   * @default true
   */
  readonly $autoSelectFirstTab = input<boolean>(true, {
    alias: 'autoSelectFirstTab',
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * Names the strip of tabs for screen readers, the group's `tablist`: "Report sheets". Without it the strip has no
   * name, and a label with no words names nothing.
   * @default undefined
   */
  readonly $label: InputSignal<string | undefined> = input<string>(undefined, {
    alias: 'label',
  });
  // the strip takes the label when it has words
  protected readonly $hasLabel = computed(() => (this.$label() ?? '').trim() !== '');

  protected readonly $tabs = contentChildren<TabComponent>(TabComponent);
  protected readonly $tabElements = viewChildren<ElementRef<HTMLDivElement>>('tab');
  private readonly $strip = viewChild.required<unknown, ElementRef<HTMLElement>>('strip', { read: ElementRef });
  // Signals to manage the selected index
  private readonly $_selectedIndex = signal(-1);

  get $selectedIndex(): Signal<number> {
    return this.$_selectedIndex;
  }
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $selectedTab: Signal<TabComponent | null> = computed(() => this.$tabs()[this.$selectedIndex()] ?? null);

  // The strip is one Tab stop: the selected tab, or the first enabled one while none is selected
  protected readonly $tabStop = computed(() => {
    const selected = this.$_selectedIndex();
    return selected === -1 ? this.$tabs().findIndex(tab => !tab.$disabled()) : selected;
  });

  // Each tab's id and its panel's, which name each other
  private readonly id = `tab-group-${generateRandomString()}`;
  protected $tabId(index: number): string {
    return `${this.id}-tab-${index}`;
  }
  protected $panelId(index: number): string {
    return `${this.id}-panel-${index}`;
  }

  readonly tabSelected = output<{ index: number; key: string | undefined; tab: TabComponent }>();

  // The tabs scroll the strip as they take focus, so the strip takes none: Firefox makes a scroll container that
  // overflows a Tab stop of its own, before the selected tab
  private readonly stripTakesNoFocus = afterNextRender(() => {
    this.$strip().nativeElement.querySelector(':scope > .scroll-container')?.setAttribute('tabindex', '-1');
  });

  // The selection follows the tabs, checked once their inputs are bound: tabs that come later get the first enabled
  // one, and when the selected tab goes from the end, the last enabled one takes it. It runs on the server too, so the
  // page is rendered with a tab shown
  ngAfterContentChecked(): void {
    const tabs = this.$tabs();
    const index = this.$_selectedIndex();
    if (index >= 0 && index < tabs.length) {
      return;
    }
    if (tabs.length === 0) {
      this.$_selectedIndex.set(-1);
      return;
    }
    if (index === -1 && !this.$autoSelectFirstTab()) {
      return;
    }
    const enabled = tabs.filter(tab => !tab.$disabled());
    const next = index === -1 ? enabled.at(0) : enabled.at(-1);
    if (next) {
      this.selectTab(tabs.indexOf(next));
    }
  }

  selectTabByIndex(index: number) {
    this.selectTab(index);
  }

  private selectTab(index: number) {
    const tab = this.$tabs().at(index);
    if (!tab || tab.$disabled()) {
      return;
    }
    this.$_selectedIndex.set(index);
    this.tabSelected.emit({ index, key: tab.$key(), tab });
    // in the browser, once the tab's content is drawn; the server has no layout
    afterNextRender(
      () => {
        const tabElement = this.$tabElements().at(index)?.nativeElement;
        if (tabElement) {
          TabGroupComponent.scrollIntoStrip(tabElement);
        }
        tab.afterActivate.emit();
      },
      { injector: this.injector },
    );
  }

  // Brings the tab into view in the strip of tabs, and never scrolls the page, as scrollIntoView did on load
  private static scrollIntoStrip(tab: HTMLElement) {
    const strip = tab.closest<HTMLElement>('.scroll-container');
    if (!strip) {
      return;
    }
    const tabRect = tab.getBoundingClientRect();
    const stripRect = strip.getBoundingClientRect();
    const offset = tabRect.left < stripRect.left ? tabRect.left - stripRect.left : tabRect.right > stripRect.right ? tabRect.right - stripRect.right : 0;
    if (offset !== 0) {
      strip.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }
  selectTabByKey(key: string) {
    const tabs = this.$tabs();
    const index = tabs.findIndex(tab => tab.$key() === key);
    if (index !== -1) {
      this.selectTabByIndex(index);
    }
  }

  // The tabs pattern with automatic activation: Right and Left move to the next or the previous enabled tab, wrapping,
  // Home and End to the first or the last, and each selects the tab it moves to, since every tab's content is in the
  // page already. Enter and Space select the tab, which matters while none is selected
  onkeydown(index: number, e: KeyboardEvent) {
    let next: number | undefined;
    switch (e.key) {
      case 'Enter':
      case ' ':
        this.selectTabByIndex(index);
        e.preventDefault();
        return;
      case 'ArrowRight':
        next = this.enabledTab(index, 1);
        break;
      case 'ArrowLeft':
        next = this.enabledTab(index, -1);
        break;
      case 'Home':
        next = this.enabledTab(-1, 1);
        break;
      case 'End':
        next = this.enabledTab(this.$tabs().length, -1);
        break;
      default:
        return;
    }
    // with a modifier the key is another shortcut, such as Alt+Left for the browser's Back
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    e.preventDefault();
    const element = next === undefined ? undefined : this.$tabElements().at(next)?.nativeElement;
    if (next === undefined || !element) {
      return;
    }
    // the selection scrolls the tab into the strip once it renders, and focus never scrolls the page
    element.focus({ preventScroll: true });
    if (next === this.$_selectedIndex()) {
      TabGroupComponent.scrollIntoStrip(element);
    } else {
      this.selectTab(next);
    }
  }

  // The first enabled tab after `start`, `step` at a time, wrapping past the ends
  private enabledTab(start: number, step: 1 | -1): number | undefined {
    const tabs = this.$tabs();
    for (let move = 1; move <= tabs.length; move++) {
      const index = (((start + step * move) % tabs.length) + tabs.length) % tabs.length;
      if (!tabs[index].$disabled()) {
        return index;
      }
    }
    return undefined;
  }
}
