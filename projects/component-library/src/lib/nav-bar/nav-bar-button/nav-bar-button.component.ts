import { ChangeDetectionStrategy, Component, computed, input, InputSignal, output, signal } from '@angular/core';
import { RouterModule, UrlTree } from '@angular/router';
import { IconComponent } from '../../icon/icon.component';
import { TooltipDirective } from '../../tooltip/tooltip.directive';

@Component({
    selector: 'tab-nav-bar-button',
    templateUrl: './nav-bar-button.component.html',
    styleUrl: './nav-bar-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NavBarButtonComponent {
  text = input.required<string>();
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  link: InputSignal<string | any[] | UrlTree | null | undefined> = input<string | any[] | UrlTree | null | undefined>();

  click = output<void>();
  isActive = input<boolean>(false);
  disabled = input<boolean>(false);

  private expanded = signal(false);
  protected isExpanded = computed(() => this.expanded());
  setExpandedInternal(expanded: boolean) {
    this.expanded.set(expanded);
  }
}
