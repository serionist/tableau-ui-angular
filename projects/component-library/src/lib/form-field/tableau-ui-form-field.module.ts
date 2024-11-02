import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormLabelComponent } from "./form-label";
import { PrefixComponent } from "../common/prefix";
import { SuffixComponent } from "../common/suffix";
import { ReactiveFormsModule } from "@angular/forms";
import { TableauUiCommonModule } from "../common/tableau-ui-common.module";
import { FormFieldComponent } from "./form-field.component";
import { ErrorStateMatcherDirective } from "./errors/error-state-matcher.directive";

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, TableauUiCommonModule],
    declarations: [FormLabelComponent,  FormFieldComponent, ErrorStateMatcherDirective],
    exports: [FormLabelComponent,  FormFieldComponent, ErrorStateMatcherDirective]
})
export class TableauUiFormFieldModule {

}