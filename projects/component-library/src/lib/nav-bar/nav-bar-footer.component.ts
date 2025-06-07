import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: 'tab-nav-bar-footer',
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NavBarFooterComponent {
}