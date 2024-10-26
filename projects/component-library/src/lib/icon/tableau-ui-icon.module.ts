import { NgModule } from "@angular/core";
import { IconButtonDirective } from "./icon-button.directive";
import { IconComponent } from "./icon.component";

@NgModule({
    imports: [],
    declarations: [IconComponent, IconButtonDirective],
    exports: [IconComponent, IconButtonDirective]
})
export class TableauUiIconModule {
}