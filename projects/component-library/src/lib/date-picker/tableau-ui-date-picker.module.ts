import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DatePickerDirective } from "./date-picker.directive";

@NgModule({
    imports: [CommonModule, ReactiveFormsModule],
    declarations: [DatePickerDirective],
    exports: [DatePickerDirective],
})
export class TableauUiDatePickerModule {}