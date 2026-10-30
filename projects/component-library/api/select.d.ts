// The public API of tableau-ui-angular/select, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i5 from '@angular/common';
import * as i0 from '@angular/core';
import { InputSignal, OnDestroy, PipeTransform, Signal, TemplateRef, WritableSignal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as i8 from 'tableau-ui-angular/button';
import * as i6 from 'tableau-ui-angular/common';
import { IOptionGridContext, IOptionLineContext, OptionComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import * as i9 from 'tableau-ui-angular/dialog';
import * as i7 from 'tableau-ui-angular/icon';
import { Primitive } from 'tableau-ui-angular/types';

declare class IsSelectedValuePipe<T extends Primitive> implements PipeTransform {
  transform(option: OptionComponent<T>, allowMultiple: boolean, value: T | T[] | undefined): boolean;
  static ɵfac: i0.ɵɵFactoryDeclaration<IsSelectedValuePipe<any>, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<IsSelectedValuePipe<any>, 'isSelectedValue', false>;
}

export declare class MultiSelectComponent<T extends Primitive> extends SelectBaseComponent<T, T[]> {
  readonly $multipleSelectionMaxItemsListed: import('@angular/core').InputSignal<number>;
  readonly $multipleSelectionNumberSelectedTemplate: import('@angular/core').InputSignal<string>;
  readonly $hasValue: Signal<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<MultiSelectComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MultiSelectComponent<any>,
    'tab-multi-select',
    never,
    {
      $multipleSelectionMaxItemsListed: {
        alias: 'multipleSelectionMaxItemsListed';
        required: false;
        isSignal: true;
      };
      $multipleSelectionNumberSelectedTemplate: {
        alias: 'multipleSelectionNumberSelectedTemplate';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    ['tab-prefix', 'tab-suffix'],
    false,
    never
  >;
}

declare class MultipleTemplatePipe implements PipeTransform {
  transform(template: string, number: number): unknown;
  static ɵfac: i0.ɵɵFactoryDeclaration<MultipleTemplatePipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<MultipleTemplatePipe, 'multipleTemplate', false>;
}

declare abstract class SelectBaseComponent<TOption extends Primitive, TValue extends TOption | TOption[]> implements ControlValueAccessor, OnDestroy {
  readonly $disabled: import('@angular/core').ModelSignal<boolean>;
  readonly $placeholder: InputSignal<string | undefined>;
  readonly $value: import('@angular/core').ModelSignal<TValue | undefined>;
  readonly $dropdownContainerCss: InputSignal<Record<string, string>>;
  readonly $dropdownOptionsContainerCss: InputSignal<Record<string, string>>;
  readonly $showChevron: InputSignal<boolean>;
  readonly $selectedCheckIconLocation: InputSignal<'left' | 'none' | 'right'>;
  readonly $selectedItemHighlight: InputSignal<boolean>;
  readonly $allowClear: InputSignal<boolean>;
  readonly $selectedValueWrapMode: InputSignal<'truncate' | 'wrap'>;
  readonly $selectedValueTemplateContext: InputSignal<IOptionLineContext>;
  readonly $dropdownValueTemplateContext: InputSignal<IOptionGridContext>;
  constructor();
  ngOnDestroy(): void;
  abstract readonly $hasValue: Signal<boolean>;
  onChange: (value: TValue | undefined) => void;
  onTouched: () => void;
  writeValue(value: TValue | undefined): void;
  registerOnChange(fn: (value: TValue | undefined) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;
  optionMouseDown(event: MouseEvent): void;
  selectValue(option: OptionComponent<TOption>): void;
  clearValue(e: Event): void;
  openDropdown(): void;
  onKeyDown(e: KeyboardEvent): void;
  clearKeyDown(e: KeyboardEvent): void;
  optionKeyNavSubscription: Subscription | undefined;
  static ɵfac: i0.ɵɵFactoryDeclaration<SelectBaseComponent<any, any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SelectBaseComponent<any, any>,
    never,
    never,
    {
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $placeholder: {
        alias: 'placeholder';
        required: false;
        isSignal: true;
      };
      $value: {
        alias: 'value';
        required: false;
        isSignal: true;
      };
      $dropdownContainerCss: {
        alias: 'dropdownContainerCss';
        required: false;
        isSignal: true;
      };
      $dropdownOptionsContainerCss: {
        alias: 'dropdownOptionsContainerCss';
        required: false;
        isSignal: true;
      };
      $showChevron: {
        alias: 'showChevron';
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
      $allowClear: {
        alias: 'allowClear';
        required: false;
        isSignal: true;
      };
      $selectedValueWrapMode: {
        alias: 'selectedValueWrapMode';
        required: false;
        isSignal: true;
      };
      $selectedValueTemplateContext: {
        alias: 'selectedValueTemplateContext';
        required: false;
        isSignal: true;
      };
      $dropdownValueTemplateContext: {
        alias: 'dropdownValueTemplateContext';
        required: false;
        isSignal: true;
      };
    },
    {
      $disabled: 'disabledChange';
      $value: 'valueChange';
    },
    ['$options', '$dropdownPrefix', '$dropdownSuffix'],
    never,
    true,
    never
  >;
}

export declare class SingleSelectComponent<T extends Primitive> extends SelectBaseComponent<T, T> {
  readonly $hasValue: Signal<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<SingleSelectComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SingleSelectComponent<any>,
    'tab-single-select',
    never,
    {
      $multipleSelectionMaxItemsListed: {
        alias: '$multipleSelectionMaxItemsListed';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    ['tab-prefix', 'tab-suffix'],
    false,
    never
  >;
}

export declare class TableauUiSelectModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiSelectModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiSelectModule,
    [typeof IsSelectedValuePipe, typeof MultipleTemplatePipe, typeof SingleSelectComponent, typeof MultiSelectComponent],
    [typeof i5.CommonModule, typeof i6.TableauUiCommonModule, typeof i7.TableauUiIconModule, typeof i8.TableauUiButtonModule, typeof i9.TableauUiDialogModule],
    [typeof SingleSelectComponent, typeof MultiSelectComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiSelectModule>;
}

export {};
