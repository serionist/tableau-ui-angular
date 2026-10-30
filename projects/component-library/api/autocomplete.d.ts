// The public API of tableau-ui-angular/autocomplete, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i4 from '@angular/common';
import * as i0 from '@angular/core';
import { OnDestroy, Signal, TemplateRef, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import * as i3 from 'tableau-ui-angular/common';
import { IOptionGridContext, OptionComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import * as i5 from 'tableau-ui-angular/dialog';
import { DialogRef } from 'tableau-ui-angular/dialog';
import { Primitive } from 'tableau-ui-angular/types';

export declare class AutoCompleteComponent<T extends Primitive> {
  readonly selectValue$: Subject<OptionComponent<T>>;
  readonly $dropdownContainerCss: import('@angular/core').ModelSignal<Record<string, string>>;
  readonly $dropdownOptionsContainerCss: import('@angular/core').ModelSignal<Record<string, string>>;
  readonly $dropdownValueTemplateContext: import('@angular/core').ModelSignal<IOptionGridContext>;
  constructor();
  openDropdown(parentControl: HTMLInputElement): DialogRef<unknown> | undefined;
  closeDropdown(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<AutoCompleteComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AutoCompleteComponent<any>,
    'tab-autocomplete',
    never,
    {
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
      $dropdownValueTemplateContext: {
        alias: 'dropdownValueTemplateContext';
        required: false;
        isSignal: true;
      };
    },
    {
      $dropdownContainerCss: 'dropdownContainerCssChange';
      $dropdownOptionsContainerCss: 'dropdownOptionsContainerCssChange';
      $dropdownValueTemplateContext: 'dropdownValueTemplateContextChange';
    },
    ['$options', '$dropdownPrefix', '$dropdownSuffix'],
    ['tab-prefix', 'tab-suffix'],
    false,
    never
  >;
}

export declare class AutoCompleteDirective<T extends Primitive> implements OnDestroy {
  readonly $tabAutoComplete: import('@angular/core').InputSignal<AutoCompleteComponent<T>>;
  constructor();
  onFocusIn(): void;
  onFocusOut(): void;
  onInput(): void;
  onClick(): void;
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<AutoCompleteDirective<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AutoCompleteDirective<any>,
    'input[tabAutoComplete]',
    never,
    {
      $tabAutoComplete: {
        alias: 'tabAutoComplete';
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

export declare class TableauUiAutoCompleteModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiAutoCompleteModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiAutoCompleteModule,
    [typeof AutoCompleteComponent, typeof AutoCompleteDirective],
    [typeof i3.TableauUiCommonModule, typeof i4.CommonModule, typeof i5.TableauUiDialogModule],
    [typeof AutoCompleteComponent, typeof AutoCompleteDirective]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiAutoCompleteModule>;
}
