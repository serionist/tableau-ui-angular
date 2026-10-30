// The public API of tableau-ui-angular/list, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i4 from '@angular/common';
import * as i0 from '@angular/core';
import { PipeTransform, WritableSignal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import * as i5 from 'tableau-ui-angular/common';
import { IOptionGridContext, OptionComponent } from 'tableau-ui-angular/common';
import * as i6 from 'tableau-ui-angular/icon';
import { Primitive } from 'tableau-ui-angular/types';

declare class IsValueSelectedPipe<T extends Primitive> implements PipeTransform {
  transform(selectedValue: T | T[] | undefined, optionValue: T, allowMultiple: boolean): boolean;
  static ɵfac: i0.ɵɵFactoryDeclaration<IsValueSelectedPipe<any>, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<IsValueSelectedPipe<any>, 'isValueSelected', false>;
}

declare abstract class ListBaseComponent<TOption extends Primitive, TValue extends TOption | TOption[]> implements ControlValueAccessor {
  readonly $focusMode: import('@angular/core').ModelSignal<'none' | 'silent' | 'strong'>;
  readonly $disabled: import('@angular/core').ModelSignal<boolean>;
  readonly $value: import('@angular/core').ModelSignal<TValue | undefined>;
  readonly $selectedCheckIconLocation: import('@angular/core').ModelSignal<'none' | 'left' | 'right'>;
  readonly $selectedItemHighlight: import('@angular/core').ModelSignal<boolean>;
  readonly $itemTemplateContext: import('@angular/core').ModelSignal<IOptionGridContext>;
  onChange: (value: TValue | undefined) => void;
  onTouched: () => void;
  writeValue(value: TValue | undefined): void;
  registerOnChange(fn: (value: TValue | undefined) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;
  selectValue(option: OptionComponent<TOption>, event: MouseEvent): void;
  clearValue(e: Event): void;
  onFocus(): void;
  onBlur(): void;
  onMouseOut(): void;
  onKeyDown(e: KeyboardEvent): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ListBaseComponent<any, any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ListBaseComponent<any, any>,
    never,
    never,
    {
      $focusMode: {
        alias: 'focusMode';
        required: false;
        isSignal: true;
      };
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $value: {
        alias: 'value';
        required: false;
        isSignal: true;
      };
      $selectedCheckIconLocation: {
        alias: 'selectedCheckIconLocation';
        required: false;
        isSignal: true;
      };
      $selectedItemHighlight: {
        alias: 'selectedItemHighlight';
        required: false;
        isSignal: true;
      };
      $itemTemplateContext: {
        alias: 'itemTemplateContext';
        required: false;
        isSignal: true;
      };
    },
    {
      $focusMode: 'focusModeChange';
      $disabled: 'disabledChange';
      $value: 'valueChange';
      $selectedCheckIconLocation: 'selectedCheckIconLocationChange';
      $selectedItemHighlight: 'selectedItemHighlightChange';
      $itemTemplateContext: 'itemTemplateContextChange';
    },
    ['$options'],
    never,
    true,
    never
  >;
}

export declare class ListMultiSelectComponent<T extends Primitive> extends ListBaseComponent<T, T[]> {
  static ɵfac: i0.ɵɵFactoryDeclaration<ListMultiSelectComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<ListMultiSelectComponent<any>, 'tab-list-multi-select', never, {}, {}, never, never, false, never>;
}

export declare class ListSingleSelectComponent<T extends Primitive> extends ListBaseComponent<T, T> {
  static ɵfac: i0.ɵɵFactoryDeclaration<ListSingleSelectComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<ListSingleSelectComponent<any>, 'tab-list-single-select', never, {}, {}, never, never, false, never>;
}

export declare class TableauUiListModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiListModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiListModule,
    [typeof IsValueSelectedPipe, typeof ListSingleSelectComponent, typeof ListMultiSelectComponent],
    [typeof i4.CommonModule, typeof i5.TableauUiCommonModule, typeof i6.TableauUiIconModule],
    [typeof ListSingleSelectComponent, typeof ListMultiSelectComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiListModule>;
}

export {};
