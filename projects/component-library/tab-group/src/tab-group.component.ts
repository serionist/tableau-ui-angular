import type { AfterContentChecked, Signal, ElementRef } from '@angular/core';
import { afterNextRender, Component, contentChildren, signal, computed, ChangeDetectionStrategy, inject, Injector, input, viewChildren, output } from '@angular/core';
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

  protected readonly $tabs = contentChildren<TabComponent>(TabComponent);
  protected readonly $tabElements = viewChildren<ElementRef<HTMLDivElement>>('tab');
  // Signals to manage the selected index
  private readonly $_selectedIndex = signal(-1);

  get $selectedIndex(): Signal<number> {
    return this.$_selectedIndex;
  }
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $selectedTab: Signal<TabComponent | null> = computed(() => this.$tabs()[this.$selectedIndex()] ?? null);

  readonly tabSelected = output<{ index: number; key: string | undefined; tab: TabComponent }>();

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

  onkeydown(index: number, e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        this.selectTabByIndex(index);
        e.preventDefault();
        break;
      default:
        return;
    }
  }
}
