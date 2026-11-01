import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NavBarState } from './nav-bar-state';

@Component({
  selector: 'tab-nav-bar-header',
  standalone: false,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.expanded]': '$isExpanded()',
  },
})
export class NavBarHeaderComponent {
  private readonly bar = inject(NavBarState, { optional: true });

  /**
   * Whether the header shows the bar open or closed, which its `expanded` attribute says, for its styles to follow.
   * The bar's state by default.
   */
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $expanded: InputSignal<boolean | undefined> = input<boolean>(undefined, {
    alias: 'expanded',
  });

  protected readonly $isExpanded = computed(() => this.$expanded() ?? this.bar?.$expanded() ?? true);
}
