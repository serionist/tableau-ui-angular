import { Component, ContentChildren, QueryList, AfterContentInit, contentChildren, signal, computed, ChangeDetectionStrategy, Signal, input, viewChildren, ElementRef } from '@angular/core';
import { TabComponent } from './tab.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tab-group',
    standalone: false,
    templateUrl: './tabgroup.component.html',
    styleUrl: './tabgroup.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {},
})
export class TabGroupComponent implements AfterContentInit {
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

    protected readonly $tabs = contentChildren(TabComponent);
    protected readonly $tabElements = viewChildren<ElementRef<HTMLDivElement>>('tab');
    // Signals to manage the selected index
    private readonly $_selectedIndex = signal(0);

    get $selectedIndex(): Signal<number> {
        return this.$_selectedIndex;
    }
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $selectedTab: Signal<TabComponent | null> = computed(() => this.$tabs()[this.$selectedIndex()] ?? null);

    selectTab(index: number) {
        const tab = this.$tabs()[index];
        if (!tab || tab.$disabled()) {
            return;
        }
        this.$_selectedIndex.set(index);
        const tabElement = this.$tabElements()[index];
        if (tabElement) {
            tabElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    ngAfterContentInit() {
        // Ensure the first tab is selected by default if available
        const firstNonDisabledTabIndex = this.$tabs().findIndex((tab) => !tab.$disabled());
        if (firstNonDisabledTabIndex !== -1) {
            this.$_selectedIndex.set(firstNonDisabledTabIndex);
        }
    }

    onkeydown(index: number, e: KeyboardEvent) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                this.selectTab(index);
                e.preventDefault();
                break;
            default:
                return;
        }
    }
}
