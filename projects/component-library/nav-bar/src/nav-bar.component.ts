import type { Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, model } from '@angular/core';
import { NavBarHeaderComponent } from './nav-bar-header.component';
import { NavBarFooterComponent } from './nav-bar-footer.component';

@Component({
  selector: 'tab-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.expanded]': '$expanded()',
  },
})
export class NavBarComponent {
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $header: Signal<NavBarHeaderComponent | undefined> = contentChild(NavBarHeaderComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $footer: Signal<NavBarFooterComponent | undefined> = contentChild(NavBarFooterComponent);

  // Its buttons read it, wherever they are in the bar and whenever they come
  readonly $expanded = model<boolean>(true, {
    alias: 'expanded',
  });
}
