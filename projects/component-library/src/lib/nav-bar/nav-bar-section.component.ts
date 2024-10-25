import { CommonModule } from "@angular/common";
import { Component, contentChildren, inject, input, model, TemplateRef, viewChild } from "@angular/core";
import { SeparatorComponent } from "../common/separator";
import { OptionComponent } from "../common/option";
import { Router, RouterModule, RouterState } from "@angular/router";
import { TooltipDirective } from "../tooltip/tooltip.directive";

@Component({
selector: 'tab-nav-bar-section',
standalone: true,
templateUrl: './nav-bar-section.component.html',
styleUrl: './nav-bar-section.component.scss',
imports: [CommonModule, SeparatorComponent, TooltipDirective, OptionComponent, RouterModule]
})
export class NavBarSectionComponent {
    topSeparator = input<boolean>(false);
    bottomSeparator = input<boolean>(false);
    options = contentChildren(OptionComponent);
    expanded = model<boolean>(true);

    template = viewChild<TemplateRef<any>>('template');
    router = inject(Router);

    isActive(url: string) {
        this.router.routerState.snapshot.url === url;
    }


}
