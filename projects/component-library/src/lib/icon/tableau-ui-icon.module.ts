import { ModuleWithProviders, NgModule } from "@angular/core";
import { IconButtonDirective } from "./icon-button.directive";
import { IconComponent } from "./icon.component";
import { ICON_CONFIG, IconConfig } from "./icon-config";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [CommonModule],
    declarations: [IconComponent, IconButtonDirective],
    exports: [IconComponent, IconButtonDirective]
})
export class TableauUiIconModule {
    static forRoot(config: IconConfig = { enableDynamicIcons: false }): ModuleWithProviders<TableauUiIconModule> {
        return {
            ngModule: TableauUiIconModule,
            providers: [
                { provide: ICON_CONFIG, useValue: config }  // Provide ICON_CONFIG based on the config
            ]
        };
    }
}