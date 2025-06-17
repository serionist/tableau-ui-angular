import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TableauUiCommonModule } from "tableau-ui-angular/common";
import { TableauUiTooltipModule } from "tableau-ui-angular/tooltip";
import { ButtonToggleComponent } from "./button-toggle.component";

@NgModule({
    imports: [TableauUiCommonModule, CommonModule, TableauUiTooltipModule],
    declarations: [ButtonToggleComponent],
    exports: [ButtonToggleComponent],
})
export class TableauUiButtonToggleModule {}