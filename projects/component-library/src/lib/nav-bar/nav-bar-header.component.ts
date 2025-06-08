import { CommonModule } from '@angular/common';
import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input, model, ModelSignal } from '@angular/core';

@Component({
    selector: 'tab-nav-bar-header',
    standalone: false,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarHeaderComponent {
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $expanded: InputSignal<boolean | undefined> = input<boolean>(undefined, {
        alias: 'expanded',
    });
}
