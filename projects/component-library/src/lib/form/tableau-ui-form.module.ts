import { NgModule } from "@angular/core";
import { FormArrayControlsPipe } from "./form-array-controls.pipe";
import { FormControlPipe } from "./form-control.pipe";
import { GetFormErrorPipe } from "./form-get-error.pipe";
import { HasFormErrorPipe } from "./form-has-error";
import { FormMetaPipe } from "./form-meta.pipe";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FormValuePipe } from "./form-value.pipe";

@NgModule({
    imports: [ReactiveFormsModule, CommonModule],
    declarations: [FormArrayControlsPipe, FormControlPipe, GetFormErrorPipe, HasFormErrorPipe, FormMetaPipe, FormValuePipe],
    exports: [FormArrayControlsPipe, FormControlPipe, GetFormErrorPipe, HasFormErrorPipe, FormMetaPipe, FormValuePipe],
})
export class TableauUiFormModule { }