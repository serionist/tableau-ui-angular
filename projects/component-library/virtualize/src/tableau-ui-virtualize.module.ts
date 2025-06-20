import { NgModule } from "@angular/core";
import { VirtualizeComponent } from "./virtualize.component";
import { CommonModule } from "@angular/common";
import { ItemTemplateDirective } from "./templates/item-template.directive";
import { LoadingTemplateDirective } from "./templates/loading-template.directive";
import { ErrorTemplateDirective } from "./templates/error-template.directive";
import { CustomLoaderDirective } from "./templates/custom-loader.directive";

@NgModule({
    imports: [CommonModule],
    declarations: [VirtualizeComponent, ItemTemplateDirective, LoadingTemplateDirective, ErrorTemplateDirective, CustomLoaderDirective],
    exports: [VirtualizeComponent, ItemTemplateDirective, LoadingTemplateDirective, ErrorTemplateDirective, CustomLoaderDirective],
})
export class TableauUiVirtualizeModule {}