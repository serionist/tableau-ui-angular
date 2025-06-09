import { CommonModule } from '@angular/common';
import type { AfterContentInit, Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, contentChildren, input, model, ViewEncapsulation } from '@angular/core';
import { NavBarHeaderComponent } from './nav-bar-header.component';
import { NavBarFooterComponent } from './nav-bar-footer.component';
import { NavBarButtonComponent } from './nav-bar-button/nav-bar-button.component';
import { IconComponent } from 'tableau-ui-angular/icon';
import { ArrowScrollComponent } from 'tableau-ui-angular/arrow-scroll';
import { TooltipDirective } from 'tableau-ui-angular/tooltip';
import { ButtonComponent } from 'tableau-ui-angular/button';

@Component({
    selector: 'tab-nav-bar',
    imports: [IconComponent, ArrowScrollComponent, TooltipDirective, ButtonComponent],
    standalone: true,
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.expanded]': '$expanded()',
    },
})
export class NavBarComponent implements AfterContentInit {
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $header: Signal<NavBarHeaderComponent | undefined> = contentChild(NavBarHeaderComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $footer: Signal<NavBarFooterComponent | undefined> = contentChild(NavBarFooterComponent);

    readonly $expanded = model<boolean>(true, {
        alias: 'expanded',
    });

    private readonly $buttons = contentChildren(NavBarButtonComponent);

    ngAfterContentInit(): void {
        this.setButtonExpanded(this.$expanded());
        this.$expanded.subscribe((e) => {
            this.setButtonExpanded(e);
        });
    }

    private setButtonExpanded(expanded: boolean) {
        this.$buttons().forEach((b) => {
            b.setExpandedInternal(expanded);
        });
    }
}
