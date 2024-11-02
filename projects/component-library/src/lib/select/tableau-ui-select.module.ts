import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TableauUiIconModule } from "../icon/tableau-ui-icon.module";
import { TableauUiCommonModule } from "../common/tableau-ui-common.module";
import { SelectComponent } from "./select.component";

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, TableauUiIconModule],
    declarations: [SelectComponent],
    exports: [SelectComponent]
})
export class TableauUiSelectModule {

}
