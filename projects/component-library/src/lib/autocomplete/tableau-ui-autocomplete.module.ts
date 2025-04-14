import { NgModule } from "@angular/core";
import { AutoCompleteComponent } from "./autocomplete.component";
import { TableauUiCommonModule } from "../common/tableau-ui-common.module";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [AutoCompleteComponent],
    exports: [AutoCompleteComponent],
    imports: [TableauUiCommonModule, CommonModule],
})
export class TableauUiAutoCompleteModule {
}