import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MenuComponent } from "./menu.component";
import { TableauUiCommonModule } from "../common/tableau-ui-common.module";
import { TableauUiDialogModule } from "../dialogservice/tableau-ui-dialog.module";
import { MenuDirective } from "./menu.directive";
import { MenuButtonComponent } from "./menu-button.component";
import { TableauUiIconModule } from "../icon/tableau-ui-icon.module";
import { MenuButtonGroupComponent } from "./menu-button-group.component";
import { ButtonMenuComponent } from "./button.menu.component";

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, TableauUiDialogModule, TableauUiIconModule],
    declarations: [MenuComponent, MenuDirective, MenuButtonComponent, MenuButtonGroupComponent, ButtonMenuComponent],
    exports: [MenuComponent, MenuDirective, MenuButtonComponent, MenuButtonGroupComponent, ButtonMenuComponent]
})
export class TableauUiMenuModule {

}