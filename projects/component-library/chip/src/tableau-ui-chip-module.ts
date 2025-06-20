import { NgModule } from "@angular/core";
import { ChipComponent } from "./chip.component";
import { TableauUiIconModule } from "tableau-ui-angular/icon";
import { TableauUiButtonModule } from "tableau-ui-angular/button";
import { TableauUiTooltipModule } from "tableau-ui-angular/tooltip";

@NgModule({
    imports: [TableauUiIconModule, TableauUiButtonModule, TableauUiTooltipModule],
    declarations: [ChipComponent],
    exports: [ChipComponent],
})
export class TableauUiChipModule {}