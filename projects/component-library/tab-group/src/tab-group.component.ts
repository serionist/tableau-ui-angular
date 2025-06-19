import type { Signal, ElementRef, AfterViewInit } from '@angular/core';
import { Component, contentChildren, signal, computed, ChangeDetectionStrategy, input, viewChildren, output } from '@angular/core';
import { TabComponent } from './tab.component';

@Component({
  selector: 'tab-group',
  standalone: false,
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {},
})
export class TabGroupComponent implements AfterViewInit {
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
  selectTabByIndex(index: number) {
    const tabs = this.$tabs();

    const tab = tabs[index];
    if (tab.$disabled()) {
      return;
    }
    this.$_selectedIndex.set(index);
    const tabElement = this.$tabElements()[index];
    tabElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.tabSelected.emit({ index, key: tab.$key(), tab });
    window.requestAnimationFrame(() => {
      tab.afterActivate.emit();
    });
  }
  selectTabByKey(key: string) {
    const tabs = this.$tabs();
    const index = tabs.findIndex(tab => tab.$key() === key);
    if (index !== -1) {
      this.selectTabByIndex(index);
    }
  }

  ngAfterViewInit() {
    // Ensure the first tab is selected by default if available
    if (this.$autoSelectFirstTab()) {
      const firstNonDisabledTabIndex = this.$tabs().findIndex(tab => !tab.$disabled());
      if (firstNonDisabledTabIndex !== -1) {
        this.selectTabByIndex(firstNonDisabledTabIndex);
      }
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
