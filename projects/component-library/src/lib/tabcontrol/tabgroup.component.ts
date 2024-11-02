import { Component, ContentChildren, QueryList, AfterContentInit, contentChildren, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { TabComponent} from './tab.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tab-group',
  templateUrl: './tabgroup.component.html',
  styleUrls: ['./tabgroup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabGroupComponent implements AfterContentInit {
  tabs = contentChildren(TabComponent);

  // Signals to manage the selected index
  private selectedIndexSignal = signal(0);

  selectedIndex = computed(() => this.selectedIndexSignal());
  selectedTab = computed(() => this.tabs()[this.selectedIndex()] ?? null);

  selectTab(index: number) {
    const tab = this.tabs()[index];
    if (!tab || tab.disabled()) {
      return;
    }
    this.selectedIndexSignal.set(index);
  }

  ngAfterContentInit() {
    // Ensure the first tab is selected by default if available
    const firstNonDisabledTabIndex = this.tabs().findIndex(tab => !tab.disabled());
    if (firstNonDisabledTabIndex !== -1) {
      this.selectedIndexSignal.set(firstNonDisabledTabIndex);
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
