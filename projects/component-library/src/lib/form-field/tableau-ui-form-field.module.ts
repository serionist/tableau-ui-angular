import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormLabelComponent } from "./form-label";
import { PrefixComponent } from "../common/prefix";
import { SuffixComponent } from "../common/suffix";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TableauUiCommonModule } from "../common/tableau-ui-common.module";
import { FormFieldComponent } from "./form-field.component";

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, ReactiveFormsModule],
    declarations: [FormLabelComponent,  FormFieldComponent],
    exports: [FormLabelComponent,  FormFieldComponent]
})
export class TableauUiFormFieldModule {

}