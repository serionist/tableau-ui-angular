import { Component, computed, input, signal } from '@angular/core';
import { RouterModule, UrlTree } from '@angular/router';
import { IconComponent } from '../../icon/icon.component';
import { TooltipDirective } from '../../tooltip/tooltip.directive';

@Component({
  selector: 'tab-nav-bar-button',
  templateUrl: './nav-bar-button.component.html',
  styleUrl: './nav-bar-button.component.scss'
})
export class NavBarButtonComponent {
  icon = input.required<string>();
  text = input.required<string>();
  routerLink = input<string | any[] | UrlTree | null | undefined>();
  isActive = input<boolean>(false);
  disabled = input<boolean>(false);

  private expanded = signal(false);
  isExpanded = computed(() => this.expanded());
  setExpandedInternal(expanded: boolean) {
    this.expanded.set(expanded);
  }
}