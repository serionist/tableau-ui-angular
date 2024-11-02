import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, Component, contentChild, contentChildren, input, model, ViewEncapsulation } from '@angular/core';
import { NavBarHeaderComponent } from './nav-bar-header.component';
import { NavBarFooterComponent } from './nav-bar-footer.component';
import { NavBarButtonComponent } from './nav-bar-button/nav-bar-button.component';
import { IconButtonDirective } from '../icon/icon-button.directive';
import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

@Component({
  selector: 'tab-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  host: {
    '[attr.expanded]': 'expanded()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent implements AfterContentInit {
  header = contentChild(NavBarHeaderComponent);
  footer = contentChild(NavBarFooterComponent);
  
  expanded = model<boolean>(true);

   buttons = contentChildren(NavBarButtonComponent);

  ngAfterContentInit(): void {
    this.setButtonExpanded(this.expanded());
    this.expanded.subscribe(e => this.setButtonExpanded(e));
  }

  private setButtonExpanded(expanded: boolean) {
     this.buttons().forEach(b => b.setExpandedInternal(expanded));
  }
  
}
