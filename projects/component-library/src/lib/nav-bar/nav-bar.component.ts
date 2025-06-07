import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    contentChildren,
    input,
    model,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { NavBarHeaderComponent } from './nav-bar-header.component';
import { NavBarFooterComponent } from './nav-bar-footer.component';
import { NavBarButtonComponent } from './nav-bar-button/nav-bar-button.component';
import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

@Component({
    selector: 'tab-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.scss',
    host: {
        '[attr.expanded]': '$expanded()',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class NavBarComponent implements AfterContentInit {
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $header: Signal<NavBarHeaderComponent | undefined> = contentChild(
        NavBarHeaderComponent
    );
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $footer: Signal<NavBarFooterComponent | undefined> = contentChild(
        NavBarFooterComponent
    );

    readonly $expanded = model<boolean>(true, {
        alias: 'expanded'
    });

    private readonly $buttons = contentChildren(NavBarButtonComponent);

    ngAfterContentInit(): void {
        this.setButtonExpanded(this.$expanded());
        this.$expanded.subscribe((e) => this.setButtonExpanded(e));
    }

    private setButtonExpanded(expanded: boolean) {
        this.$buttons().forEach((b) => b.setExpandedInternal(expanded));
    }
}
