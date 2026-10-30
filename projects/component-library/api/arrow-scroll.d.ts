// The public API of tableau-ui-angular/arrow-scroll, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i0 from '@angular/core';
import { OnDestroy } from '@angular/core';
import * as i2 from 'tableau-ui-angular/button';
import * as i3 from 'tableau-ui-angular/common';
import * as i4 from 'tableau-ui-angular/icon';
import { IconParams } from 'tableau-ui-angular/icon';

export declare class ArrowScrollComponent implements OnDestroy {
  readonly $scrollType: import('@angular/core').InputSignal<'arrow' | 'default'>;
  readonly $scrollDirection: import('@angular/core').InputSignal<'horizontal' | 'vertical'>;
  readonly $backIcon: import('@angular/core').InputSignal<string | undefined>;
  readonly $forwardIcon: import('@angular/core').InputSignal<string | undefined>;
  readonly $iconParams: import('@angular/core').InputSignal<Partial<IconParams> | undefined>;
  readonly $buttonsGap: import('@angular/core').InputSignal<string>;
  readonly $buttonsColor: import('@angular/core').InputSignal<'error' | 'plain' | 'primary' | 'secondary'>;
  readonly $buttonsCssColor: import('@angular/core').InputSignal<string | undefined>;
  readonly $buttonScrollAmount: import('@angular/core').InputSignal<number>;
  readonly $showScrollButtonSeparator: import('@angular/core').InputSignal<boolean>;
  readonly $canScroll: import('@angular/core').Signal<{
    back: boolean;
    forward: boolean;
  }>;
  constructor();
  ngOnDestroy(): void;
  onResize(): void;
  scroll(direction: 'back' | 'forward'): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ArrowScrollComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ArrowScrollComponent,
    'tab-arrow-scroll',
    never,
    {
      $scrollType: {
        alias: 'scrollType';
        required: true;
        isSignal: true;
      };
      $scrollDirection: {
        alias: 'scrollDirection';
        required: true;
        isSignal: true;
      };
      $backIcon: {
        alias: 'backIcon';
        required: false;
        isSignal: true;
      };
      $forwardIcon: {
        alias: 'forwardIcon';
        required: false;
        isSignal: true;
      };
      $iconParams: {
        alias: 'iconParams';
        required: false;
        isSignal: true;
      };
      $buttonsGap: {
        alias: 'buttonsGap';
        required: false;
        isSignal: true;
      };
      $buttonsColor: {
        alias: 'buttonsColor';
        required: false;
        isSignal: true;
      };
      $buttonsCssColor: {
        alias: 'buttonsCssColor';
        required: false;
        isSignal: true;
      };
      $buttonScrollAmount: {
        alias: 'buttonScrollAmount';
        required: false;
        isSignal: true;
      };
      $showScrollButtonSeparator: {
        alias: 'showScrollButtonSeparator';
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

export declare class TableauUiArrowScrollModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiArrowScrollModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiArrowScrollModule,
    [typeof ArrowScrollComponent],
    [typeof i2.TableauUiButtonModule, typeof i3.TableauUiCommonModule, typeof i4.TableauUiIconModule],
    [typeof ArrowScrollComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiArrowScrollModule>;
}
