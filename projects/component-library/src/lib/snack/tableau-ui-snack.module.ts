import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TableauUiIconModule } from "../icon/tableau-ui-icon.module";
import { SnackComponent } from "./snack.component";
import { SnackService } from "./snack.service";
import { SnackRef } from "./snack.ref";

@NgModule({
    imports: [CommonModule, TableauUiIconModule],
    declarations: [SnackComponent],
    exports: [SnackComponent]
})
export class TableauUiSnackModule {

}