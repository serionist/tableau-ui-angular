import { CommonModule } from "@angular/common";
import { Component, input, model } from "@angular/core";

@Component({
selector: 'tab-nav-bar-header',
standalone: true,
template: '<ng-content></ng-content>',
imports: [CommonModule]
})
export class NavBarHeaderComponent {
    expanded = model<boolean>();
}