// The public API of tableau-ui-angular/radio-group, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { InputSignal, Signal, WritableSignal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import * as i3 from 'tableau-ui-angular/common';
import { ErrorComponent, IOptionGridContext, OptionComponent } from 'tableau-ui-angular/common';
import { Primitive } from 'tableau-ui-angular/types';

export declare class RadioGroupComponent<T extends Primitive> implements ControlValueAccessor {
  readonly $disabled: WritableSignal<boolean>;
  readonly $valueInput: InputSignal<T | undefined>;
  readonly $value: WritableSignal<T | undefined>;
  readonly valueChange: import('@angular/core').OutputEmitterRef<T | undefined>;
  readonly name: string;
  readonly $options: Signal<readonly OptionComponent<T>[]>;
  readonly $errorElement: Signal<ErrorComponent | undefined>;
  onChange: (value: T | undefined) => void;
  onTouched: () => void;
  writeValue(value: T | undefined): void;
  registerOnChange(fn: (value: T | undefined) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;
  selectValue(option: OptionComponent<T>): void;
  onKeyDown(e: KeyboardEvent, option: OptionComponent<T>): void;
  generateRandomGroupName(length?: number): string;
  optionTemplateContext: IOptionGridContext;
  static ɵfac: i0.ɵɵFactoryDeclaration<RadioGroupComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    RadioGroupComponent<any>,
    'tab-radio-group',
    never,
    {
      $valueInput: {
        alias: 'value';
        required: false;
        isSignal: true;
      };
    },
    {
      valueChange: 'valueChange';
    },
    ['$options', '$errorElement'],
    ['tab-error'],
    false,
    never
  >;
}

export declare class TableauUiRadioGroupModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiRadioGroupModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiRadioGroupModule, [typeof RadioGroupComponent], [typeof i2.CommonModule, typeof i3.TableauUiCommonModule], [typeof RadioGroupComponent]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiRadioGroupModule>;
}
