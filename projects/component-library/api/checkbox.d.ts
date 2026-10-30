// The public API of tableau-ui-angular/checkbox, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { InputSignal, Signal, WritableSignal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import * as i3 from 'tableau-ui-angular/common';
import { ErrorComponent, HintComponent } from 'tableau-ui-angular/common';

export declare class CheckboxComponent implements ControlValueAccessor {
  readonly $disabled: import('@angular/core').ModelSignal<boolean>;
  readonly $valueInput: InputSignal<boolean | 'partial'>;
  readonly $value: WritableSignal<boolean | 'partial'>;
  readonly valueChange: import('@angular/core').OutputEmitterRef<boolean | 'partial'>;
  readonly $loading: InputSignal<boolean>;
  readonly $valueAfterPartial: InputSignal<boolean>;
  readonly $id: InputSignal<string | undefined>;
  readonly $name: InputSignal<string | undefined>;
  readonly $autocomplete: InputSignal<AutoFill>;
  onChange: (value: boolean) => void;
  onTouched: () => void;
  writeValue(value: boolean | 'partial' | null | undefined): void;
  registerOnChange(fn: (value: boolean) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;
  toggleValue(): void;
  onKeyDown(e: KeyboardEvent): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<CheckboxComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CheckboxComponent,
    'tab-checkbox',
    never,
    {
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $valueInput: {
        alias: 'value';
        required: false;
        isSignal: true;
      };
      $loading: {
        alias: 'loading';
        required: false;
        isSignal: true;
      };
      $valueAfterPartial: {
        alias: 'valueAfterPartial';
        required: false;
        isSignal: true;
      };
      $id: {
        alias: 'id';
        required: false;
        isSignal: true;
      };
      $name: {
        alias: 'name';
        required: false;
        isSignal: true;
      };
      $autocomplete: {
        alias: 'autocomplete';
        required: false;
        isSignal: true;
      };
    },
    {
      $disabled: 'disabledChange';
      valueChange: 'valueChange';
    },
    ['$hintElement', '$errorElement'],
    ['*', 'tab-hint', 'tab-error'],
    false,
    never
  >;
}

export declare class TableauUiCheckboxModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiCheckboxModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiCheckboxModule, [typeof CheckboxComponent], [typeof i2.CommonModule, typeof i3.TableauUiCommonModule], [typeof CheckboxComponent]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiCheckboxModule>;
}
