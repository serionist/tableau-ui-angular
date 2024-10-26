import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TabComponent } from "./tab.component";
import { TabGroupComponent } from "./tabgroup.component";

@NgModule({
    imports: [CommonModule],
    declarations: [TabComponent, TabGroupComponent],
    exports: [TabComponent, TabGroupComponent]
})
export class TableauUiTabgroupModule {
}