import { CommonModule } from "@angular/common";
import { Component, input, model } from "@angular/core";

@Component({
selector: 'tab-nav-bar-header',
template: '<ng-content></ng-content>',
})
export class NavBarHeaderComponent {
    expanded = model<boolean>();
}