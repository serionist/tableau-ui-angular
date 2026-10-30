// The public API of tableau-ui-angular/chip, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i0 from '@angular/core';
import { InputSignal } from '@angular/core';
import * as i3 from 'tableau-ui-angular/button';
import * as i2 from 'tableau-ui-angular/icon';
import * as i4 from 'tableau-ui-angular/tooltip';
import { TooltipArgs } from 'tableau-ui-angular/tooltip';

export declare class ChipComponent {
  readonly $allowRemove: InputSignal<boolean>;
  readonly $removeTooltip: InputSignal<TooltipArgs<unknown> | undefined>;
  readonly $selected: InputSignal<boolean>;
  readonly $disabled: InputSignal<boolean>;
  readonly removed: import('@angular/core').OutputEmitterRef<void>;
  static ɵfac: i0.ɵɵFactoryDeclaration<ChipComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ChipComponent,
    'tab-chip',
    never,
    {
      $allowRemove: {
        alias: 'allowRemove';
        required: false;
        isSignal: true;
      };
      $removeTooltip: {
        alias: 'removeTooltip';
        required: false;
        isSignal: true;
      };
      $selected: {
        alias: 'selected';
        required: false;
        isSignal: true;
      };
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
    },
    {
      removed: 'removed';
    },
    never,
    ['*'],
    false,
    never
  >;
}

export declare class TableauUiChipModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiChipModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiChipModule,
    [typeof ChipComponent],
    [typeof i2.TableauUiIconModule, typeof i3.TableauUiButtonModule, typeof i4.TableauUiTooltipModule],
    [typeof ChipComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiChipModule>;
}
