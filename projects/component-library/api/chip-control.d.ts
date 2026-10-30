// The public API of tableau-ui-angular/chip-control, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i4 from '@angular/common';
import * as i0 from '@angular/core';
import { ElementRef, TemplateRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import * as i3 from 'tableau-ui-angular/common';

interface ChipContext<TKey, TValue> {
  data: ChipData<TKey, TValue>;
  chipControl: ChipControlComponent<TKey, TValue>;
  selected: boolean;
  removable: boolean;
  disabled: boolean;
}

export declare class ChipControlComponent<TKey, TValue> implements ControlValueAccessor {
  readonly self: this;
  readonly $keys: import('@angular/core').ModelSignal<TKey[]>;
  readonly $values: import('@angular/core').ModelSignal<ChipData<TKey, TValue>[]>;
  readonly $keyComparer: import('@angular/core').InputSignal<(a: TKey, b: TKey) => boolean>;
  readonly $getValuesByKeys: import('@angular/core').InputSignal<(keys: TKey[]) => Promise<ChipData<TKey, TValue>[]>>;
  readonly $disabled: import('@angular/core').ModelSignal<boolean>;
  readonly $searchFocused: import('@angular/core').OutputEmitterRef<boolean>;
  readonly $searchKeydown: import('@angular/core').OutputEmitterRef<KeyboardEvent>;
  readonly $searchClicked: import('@angular/core').OutputEmitterRef<MouseEvent>;
  readonly $chipAdded: import('@angular/core').OutputEmitterRef<ChipData<TKey, TValue>>;
  readonly $chipRemoved: import('@angular/core').OutputEmitterRef<TKey>;
  clearInput(): void;
  add(key: TKey, value: TValue, clearInput: boolean): void;
  remove(key: TKey): void;
  focus(): void;
  readonly $chipTemplate: import('@angular/core').Signal<ChipTemplateDirective<TKey, TValue>>;
  writeValue(val: TKey[] | null): void;
  registerOnChange(fn: (val: TKey[]) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState?(isDisabled: boolean): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ChipControlComponent<any, any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ChipControlComponent<any, any>,
    'tab-chip-control',
    never,
    {
      $keys: {
        alias: 'keys';
        required: false;
        isSignal: true;
      };
      $values: {
        alias: 'values';
        required: false;
        isSignal: true;
      };
      $keyComparer: {
        alias: 'keyComparer';
        required: false;
        isSignal: true;
      };
      $getValuesByKeys: {
        alias: 'getValuesByKeys';
        required: true;
        isSignal: true;
      };
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
    },
    {
      $keys: 'keysChange';
      $values: 'valuesChange';
      $disabled: 'disabledChange';
      $searchFocused: '$searchFocused';
      $searchKeydown: '$searchKeydown';
      $searchClicked: '$searchClicked';
      $chipAdded: '$chipAdded';
      $chipRemoved: '$chipRemoved';
    },
    ['$chipTemplate'],
    never,
    false,
    never
  >;
}

interface ChipData<TKey, TValue> {
  key: TKey;
  value: TValue;
}

export declare class ChipTemplateDirective<TKey, TValue> {
  readonly container: import('@angular/core').InputSignal<ChipControlComponent<TKey, TValue>>;
  templateRef: TemplateRef<{
    $implicit: ChipContext<TKey, TValue>;
  }>;
  static ngTemplateContextGuard<TKey, TValue>(
    dir: ChipTemplateDirective<TKey, TValue>,
    ctx: unknown,
  ): ctx is {
    $implicit: ChipContext<TKey, TValue>;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<ChipTemplateDirective<any, any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ChipTemplateDirective<any, any>,
    '[tabChipTemplate]',
    never,
    {
      container: {
        alias: 'tabChipTemplate';
        required: true;
        isSignal: true;
      };
    },
    {},
    never,
    never,
    false,
    never
  >;
}

export declare class TableauUiChipControlModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiChipControlModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiChipControlModule,
    [typeof ChipControlComponent, typeof ChipTemplateDirective],
    [typeof i3.TableauUiCommonModule, typeof i4.CommonModule],
    [typeof ChipControlComponent, typeof ChipTemplateDirective]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiChipControlModule>;
}

export type { ChipContext, ChipData };
