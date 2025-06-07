import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'tab-nav-bar-footer',
    standalone: false,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarFooterComponent {}
