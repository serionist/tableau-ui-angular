import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormLabelComponent } from "./form-label";
import { PrefixComponent } from "../common/prefix";
import { SuffixComponent } from "../common/suffix";
import { ReactiveFormsModule } from "@angular/forms";
import { TableauUiCommonModule } from "../common/tableau-ui-common.module";
import { FormFieldComponent } from "./form-field.component";

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, TableauUiCommonModule],
    declarations: [FormLabelComponent,  FormFieldComponent],
    exports: [FormLabelComponent,  FormFieldComponent]
})
export class TableauUiFormFieldModule {

}