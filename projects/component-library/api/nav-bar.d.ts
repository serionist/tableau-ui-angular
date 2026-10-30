// The public API of tableau-ui-angular/nav-bar, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i0 from '@angular/core';
import { InputSignal, Signal } from '@angular/core';
import { UrlTree } from '@angular/router';
import * as i7 from 'tableau-ui-angular/arrow-scroll';
import * as i6 from 'tableau-ui-angular/button';
import * as i4 from 'tableau-ui-angular/icon';
import * as i5 from 'tableau-ui-angular/tooltip';

export declare class NavBarButtonComponent {
  readonly $text: InputSignal<string>;
  readonly $link: InputSignal<string[] | UrlTree | string | null | undefined>;
  readonly $isActive: InputSignal<boolean>;
  readonly $disabled: InputSignal<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<NavBarButtonComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NavBarButtonComponent,
    'tab-nav-bar-button',
    never,
    {
      $text: {
        alias: 'text';
        required: true;
        isSignal: true;
      };
      $link: {
        alias: 'link';
        required: false;
        isSignal: true;
      };
      $isActive: {
        alias: 'isActive';
        required: false;
        isSignal: true;
      };
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    ['tab-icon'],
    true,
    never
  >;
}

export declare class NavBarComponent {
  readonly $expanded: import('@angular/core').ModelSignal<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<NavBarComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NavBarComponent,
    'tab-nav-bar',
    never,
    {
      $expanded: {
        alias: 'expanded';
        required: false;
        isSignal: true;
      };
    },
    {
      $expanded: 'expandedChange';
    },
    ['$header', '$footer'],
    ['tab-nav-bar-header', '*', 'tab-nav-bar-footer'],
    false,
    never
  >;
}

export declare class NavBarFooterComponent {
  static ɵfac: i0.ɵɵFactoryDeclaration<NavBarFooterComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NavBarFooterComponent, 'tab-nav-bar-footer', never, {}, {}, never, ['*'], false, never>;
}

export declare class NavBarHeaderComponent {
  readonly $expanded: InputSignal<boolean | undefined>;
  static ɵfac: i0.ɵɵFactoryDeclaration<NavBarHeaderComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NavBarHeaderComponent,
    'tab-nav-bar-header',
    never,
    {
      $expanded: {
        alias: 'expanded';
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

export declare class TableauUiNavBarModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiNavBarModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiNavBarModule,
    [typeof NavBarHeaderComponent, typeof NavBarFooterComponent, typeof NavBarComponent],
    [typeof i4.TableauUiIconModule, typeof i5.TableauUiTooltipModule, typeof i6.TableauUiButtonModule, typeof i7.TableauUiArrowScrollModule, typeof NavBarButtonComponent],
    [typeof NavBarHeaderComponent, typeof NavBarFooterComponent, typeof NavBarButtonComponent, typeof NavBarComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiNavBarModule>;
}
