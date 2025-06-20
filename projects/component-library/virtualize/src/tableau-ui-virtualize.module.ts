import { NgModule } from "@angular/core";
import { VirtualizeComponent } from "./virtualize.component";
import { CommonModule } from "@angular/common";
import { ItemTemplateDirective } from "./templates/item-template.directive";
import { LoadingTemplateDirective } from "./templates/loading-template.directive";
import { ErrorTemplateDirective } from "./templates/error-template.directive";

@NgModule({
    imports: [CommonModule],
    declarations: [VirtualizeComponent, ItemTemplateDirective, LoadingTemplateDirective, ErrorTemplateDirective],
    exports: [VirtualizeComponent, ItemTemplateDirective, LoadingTemplateDirective, ErrorTemplateDirective],
})
export class TableauUiVirtualizeModule {}