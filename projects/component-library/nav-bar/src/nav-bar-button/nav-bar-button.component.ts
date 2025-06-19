import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { UrlTree } from '@angular/router';

@Component({
  selector: 'tab-nav-bar-button',
  standalone: false,
  templateUrl: './nav-bar-button.component.html',
  styleUrl: './nav-bar-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarButtonComponent {
  readonly $text = input.required<string>({
    alias: 'text',
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $link: InputSignal<string[] | UrlTree | string | null | undefined> = input<string[] | UrlTree | string | null | undefined>(undefined, {
    alias: 'link',
  });
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly click = output();
  readonly $isActive = input<boolean>(false, {
    alias: 'isActive',
  });
  readonly $disabled = input<boolean>(false, {
    alias: 'disabled',
  });

  private readonly $expanded = signal(false);
  protected readonly $isExpanded = computed(() => this.$expanded());
  setExpandedInternal(expanded: boolean) {
    this.$expanded.set(expanded);
  }
}
