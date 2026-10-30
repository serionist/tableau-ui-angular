import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiNavBarModule } from 'tableau-ui-angular/nav-bar';

interface Page {
  key: string;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-nav-bar-basic-example',
  imports: [TableauUiCommonModule, TableauUiIconModule, TableauUiNavBarModule],
  templateUrl: './nav-bar-basic.example.html',
  styleUrl: './nav-bar-basic.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarBasicExampleComponent {
  protected readonly pages: readonly Page[] = [
    { key: 'home', text: 'Home', icon: 'home' },
    { key: 'reports', text: 'Reports', icon: 'table' },
    { key: 'search', text: 'Search', icon: 'search' },
  ];

  protected readonly $expanded = signal(true);
  // A button without a link runs its click; with link, it is a router link instead
  protected readonly $active = signal('home');
  protected readonly $title = computed(() => this.pages.find(page => page.key === this.$active())?.text);
}
