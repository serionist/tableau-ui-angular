// The public API of tableau-ui-angular/common, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i9 from '@angular/common';
import * as i0 from '@angular/core';
import { ElementRef, InputSignal, Signal, TemplateRef } from '@angular/core';
import * as i10 from 'tableau-ui-angular/icon';
import { IconParams } from 'tableau-ui-angular/icon';
import { Primitive } from 'tableau-ui-angular/types';
import * as i11 from 'tableau-ui-angular/utils';

export declare class ErrorComponent {
  static ɵfac: i0.ɵɵFactoryDeclaration<ErrorComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<ErrorComponent, 'tab-error', never, {}, {}, never, ['*'], false, never>;
}

export declare class HintComponent {
  readonly $type: import('@angular/core').InputSignal<'prefix' | 'suffix'>;
  readonly $showOnError: import('@angular/core').InputSignal<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<HintComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HintComponent,
    'tab-hint',
    never,
    {
      $type: {
        alias: 'type';
        required: false;
        isSignal: true;
      };
      $showOnError: {
        alias: 'showOnError';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    ['*'],
    false,
    never
  >;
}

export interface IOptionGridContext extends IOptionLineContext {
  renderHint: boolean;
}

export interface IOptionLineContext {
  renderIcon: boolean;
  renderText: boolean;
  renderAsDisabled?: boolean;
}

export declare class LabelComponent {
  static ɵfac: i0.ɵɵFactoryDeclaration<LabelComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<LabelComponent, 'tab-label', never, {}, {}, never, ['*'], false, never>;
}

export declare class LoadingGifComponent {
  readonly $color: import('@angular/core').InputSignal<string>;
  readonly $width: import('@angular/core').InputSignal<string>;
  readonly $height: import('@angular/core').InputSignal<string>;
  static ɵfac: i0.ɵɵFactoryDeclaration<LoadingGifComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LoadingGifComponent,
    'tab-loading-gif',
    never,
    {
      $color: {
        alias: 'color';
        required: false;
        isSignal: true;
      };
      $width: {
        alias: 'width';
        required: false;
        isSignal: true;
      };
      $height: {
        alias: 'height';
        required: false;
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

export declare class OptionComponent<T extends Primitive> {
  readonly elementRef: ElementRef<HTMLElement>;
  readonly $value: InputSignal<T>;
  readonly $disabled: InputSignal<boolean>;
  readonly $text: InputSignal<TemplateRef<unknown> | string | undefined>;
  readonly $hint: InputSignal<TemplateRef<unknown> | string | undefined>;
  readonly $icon: InputSignal<string | undefined>;
  readonly $iconParams: InputSignal<Partial<IconParams> | undefined>;
  readonly $template: Signal<TemplateRef<IOptionGridContext>>;
  readonly $lineTemplate: Signal<TemplateRef<IOptionLineContext>>;
  static ɵfac: i0.ɵɵFactoryDeclaration<OptionComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    OptionComponent<any>,
    'tab-option',
    never,
    {
      $value: {
        alias: 'value';
        required: true;
        isSignal: true;
      };
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $text: {
        alias: 'text';
        required: false;
        isSignal: true;
      };
      $hint: {
        alias: 'hint';
        required: false;
        isSignal: true;
      };
      $icon: {
        alias: 'icon';
        required: false;
        isSignal: true;
      };
      $iconParams: {
        alias: 'iconParams';
        required: false;
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

export declare class PrefixComponent {
  readonly elementRef: ElementRef<HTMLElement>;
  static ɵfac: i0.ɵɵFactoryDeclaration<PrefixComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<PrefixComponent, 'tab-prefix', never, {}, {}, never, ['*'], false, never>;
}

export declare class SeparatorComponent {
  readonly $direction: import('@angular/core').InputSignal<'horizontal' | 'vertical'>;
  static ɵfac: i0.ɵɵFactoryDeclaration<SeparatorComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SeparatorComponent,
    'tab-separator',
    never,
    {
      $direction: {
        alias: 'direction';
        required: false;
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

export declare class SuffixComponent {
  readonly elementRef: ElementRef<HTMLElement>;
  static ɵfac: i0.ɵɵFactoryDeclaration<SuffixComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<SuffixComponent, 'tab-suffix', never, {}, {}, never, ['*'], false, never>;
}

export declare class TableauUiCommonModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiCommonModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiCommonModule,
    [typeof ErrorComponent, typeof HintComponent, typeof OptionComponent, typeof PrefixComponent, typeof SuffixComponent, typeof SeparatorComponent, typeof LoadingGifComponent, typeof LabelComponent],
    [typeof i9.CommonModule, typeof i10.TableauUiIconModule, typeof i11.TableauUiUtilsModule],
    [typeof ErrorComponent, typeof HintComponent, typeof OptionComponent, typeof SeparatorComponent, typeof LoadingGifComponent, typeof PrefixComponent, typeof SuffixComponent, typeof LabelComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiCommonModule>;
}
