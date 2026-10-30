// The public API of tableau-ui-angular/date-picker, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { InputSignal, WritableSignal } from '@angular/core';
import { AbstractControl, ControlValueAccessor } from '@angular/forms';

export declare class DatePickerDirective implements ControlValueAccessor {
  readonly $type: InputSignal<'date' | 'datetime' | 'datetime-local'>;
  readonly $valueInput: InputSignal<Date | undefined>;
  readonly $value: WritableSignal<Date | undefined>;
  readonly valueChange: import('@angular/core').OutputEmitterRef<Date | undefined>;
  onInput(): void;
  onBlur(): void;
  writeValue(obj: Date | null | undefined): void;
  registerOnChange(fn: (date: Date | undefined) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState?(isDisabled: boolean): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<DatePickerDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DatePickerDirective,
    'input[type=date],input[type=datetime-local],input[type=datetime],input[date-picker]',
    never,
    {
      $type: {
        alias: 'type';
        required: true;
        isSignal: true;
      };
      $valueInput: {
        alias: 'value';
        required: false;
        isSignal: true;
      };
    },
    {
      valueChange: 'valueChange';
    },
    never,
    never,
    false,
    never
  >;
}

export declare class DateValidators {
  static minDate(minDate: Date): (ctrl: AbstractControl) => {
    minDate: boolean;
  } | null;
  static maxDate(maxDate: Date): (ctrl: AbstractControl) => {
    maxDate: boolean;
  } | null;
}

export declare class TableauUiDatePickerModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiDatePickerModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiDatePickerModule, [typeof DatePickerDirective], [typeof i2.CommonModule], [typeof DatePickerDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiDatePickerModule>;
}
