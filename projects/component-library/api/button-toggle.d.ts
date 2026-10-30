// The public API of tableau-ui-angular/button-toggle, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i3 from '@angular/common';
import * as i0 from '@angular/core';
import { TemplateRef } from '@angular/core';
import * as i2 from 'tableau-ui-angular/common';
import { IOptionLineContext, OptionComponent } from 'tableau-ui-angular/common';
import * as i4 from 'tableau-ui-angular/tooltip';
import { Primitive } from 'tableau-ui-angular/types';

export declare class ButtonToggleComponent<T extends Primitive> {
  readonly $disabled: import('@angular/core').InputSignal<boolean>;
  readonly $selectedValue: import('@angular/core').ModelSignal<T | undefined>;
  optionClicked(option: OptionComponent<T>): void;
  onKeyDown(event: KeyboardEvent): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ButtonToggleComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ButtonToggleComponent<any>,
    'tab-button-toggle',
    never,
    {
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $selectedValue: {
        alias: 'selectedValue';
        required: false;
        isSignal: true;
      };
    },
    {
      $selectedValue: 'selectedValueChange';
    },
    ['$options'],
    never,
    false,
    never
  >;
}

export declare class TableauUiButtonToggleModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiButtonToggleModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiButtonToggleModule,
    [typeof ButtonToggleComponent],
    [typeof i2.TableauUiCommonModule, typeof i3.CommonModule, typeof i4.TableauUiTooltipModule],
    [typeof ButtonToggleComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiButtonToggleModule>;
}
