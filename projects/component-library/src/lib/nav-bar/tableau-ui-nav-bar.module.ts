import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NavBarHeaderComponent } from "./nav-bar-header.component";
import { NavBarFooterComponent } from "./nav-bar-footer.component";
import { RouterModule } from "@angular/router";
import { TableauUiIconModule } from "../icon/tableau-ui-icon.module";
import { TableauUiTooltipModule } from "../tooltip/tableau-ui-tooltip.module";
import { NavBarButtonComponent } from "./nav-bar-button/nav-bar-button.component";
import { NavBarComponent } from "./nav-bar.component";

@NgModule({
    imports: [CommonModule, RouterModule, TableauUiIconModule, TableauUiTooltipModule],
    declarations: [NavBarHeaderComponent, NavBarFooterComponent, NavBarButtonComponent,
        NavBarComponent],
    exports: [NavBarHeaderComponent, NavBarFooterComponent, NavBarButtonComponent,
        NavBarComponent
    ]
})
export class TableauUiNavBarModule {
}