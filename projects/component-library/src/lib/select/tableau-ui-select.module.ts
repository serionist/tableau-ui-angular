import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TableauUiIconModule } from "../icon/tableau-ui-icon.module";
import { TableauUiCommonModule } from "../common/tableau-ui-common.module";
import { SelectComponent } from "./select.component";
import { TableauUiButtonModule } from "../button/tableau-ui-button.module";

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, TableauUiIconModule, TableauUiButtonModule],
    declarations: [SelectComponent],
    exports: [SelectComponent]
})
export class TableauUiSelectModule {

}
