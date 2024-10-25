import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
selector: 'tab-nav-bar-footer',
standalone: true,
imports: [CommonModule],
template: '<ng-content></ng-content>'
})
export class NavBarFooterComponent {
}