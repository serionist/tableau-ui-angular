import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePickerDirective } from './date-picker.directive';

@NgModule({
    declarations: [DatePickerDirective],
    imports: [CommonModule, ReactiveFormsModule],
    exports: [DatePickerDirective],
})
export class TableauUiDatePickerModule {}
