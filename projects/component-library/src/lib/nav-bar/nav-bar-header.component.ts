import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, model, ModelSignal } from "@angular/core";

@Component({
    selector: 'tab-nav-bar-header',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NavBarHeaderComponent {
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    expanded: ModelSignal<boolean | undefined> = model<boolean>();
}