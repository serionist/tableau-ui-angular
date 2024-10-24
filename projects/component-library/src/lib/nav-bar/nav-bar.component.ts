import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, contentChild, contentChildren, input, model, ViewEncapsulation } from '@angular/core';
import { NavBarHeaderComponent } from './nav-bar-header.component';
import { NavBarFooterComponent } from './nav-bar-footer.component';
import { NavBarSectionComponent } from './nav-bar-section.component';

@Component({
  selector: 'tab-nav-bar',
  standalone: true,
  imports: [CommonModule, NavBarHeaderComponent, NavBarFooterComponent, NavBarSectionComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  host: {
    '[attr.expanded]': 'expanded()'
  }
})
export class NavBarComponent implements AfterContentInit {
  
  
  expanded = model<boolean>(true);

  sections = contentChildren(NavBarSectionComponent);

  ngAfterContentInit(): void {
    this.expanded.subscribe(e => {
      console.log('a')
      this.sections().forEach(s => s.expanded.set(e));
    });
  }
  
}
