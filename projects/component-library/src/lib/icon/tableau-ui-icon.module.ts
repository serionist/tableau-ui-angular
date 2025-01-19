import { ModuleWithProviders, NgModule } from "@angular/core";
import { IconButtonDirective } from "./icon-button.directive";
import { IconComponent } from "./icon.component";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [CommonModule],
    declarations: [IconComponent, IconButtonDirective],
    exports: [IconComponent, IconButtonDirective]
})
export class TableauUiIconModule {
}