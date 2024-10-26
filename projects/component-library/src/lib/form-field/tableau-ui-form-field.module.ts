import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormLabelComponent } from "./form-label";
import { FormPrefixComponent } from "./form-prefix";
import { FormSuffixComponent } from "./form-suffix";
import { ReactiveFormsModule } from "@angular/forms";
import { TableauUiCommonModule } from "../common/tableau-ui-common.module";
import { FormFieldComponent } from "./form-field.component";

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, TableauUiCommonModule],
    declarations: [FormLabelComponent, FormPrefixComponent, FormSuffixComponent, FormFieldComponent],
    exports: [FormLabelComponent, FormPrefixComponent, FormSuffixComponent, FormFieldComponent]
})
export class TableauUiFormFieldModule {

}