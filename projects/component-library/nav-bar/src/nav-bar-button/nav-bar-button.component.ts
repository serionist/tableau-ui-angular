import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { UrlTree } from '@angular/router';
import { RouterLink } from '@angular/router';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import { NavBarComponent } from '../nav-bar.component';

// Standalone, so its <button> is a plain one: the nav bar's module scope would make it the library's ButtonComponent
@Component({
  selector: 'tab-nav-bar-button',
  imports: [NgTemplateOutlet, RouterLink, TableauUiTooltipModule],
  templateUrl: './nav-bar-button.component.html',
  styleUrl: './nav-bar-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarButtonComponent {
  private readonly navBar = inject(NavBarComponent, { optional: true });

  readonly $text = input.required<string>({
    alias: 'text',
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $link: InputSignal<string[] | UrlTree | string | null | undefined> = input<string[] | UrlTree | string | null | undefined>(undefined, {
    alias: 'link',
  });
  readonly $isActive = input<boolean>(false, {
    alias: 'isActive',
  });
  readonly $disabled = input<boolean>(false, {
    alias: 'disabled',
  });

  // the bar's state, read whenever it changes, so a button added later and the app's [expanded] are followed
  protected readonly $isExpanded = computed(() => this.navBar?.$expanded() ?? false);

  // A disabled button runs nothing: its click stops here, before the (click) the app binds on tab-nav-bar-button
  protected onClick(event: MouseEvent) {
    if (this.$disabled()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
