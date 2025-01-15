import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";

@Component({
    selector: 'tab-nav-bar-header',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NavBarHeaderComponent {
    expanded = model<boolean>();
}