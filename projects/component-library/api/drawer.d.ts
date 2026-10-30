// The public API of tableau-ui-angular/drawer, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i3 from '@angular/common';
import * as i0 from '@angular/core';
import { TemplateRef } from '@angular/core';

export declare class DrawerComponent {
  readonly $template: import('@angular/core').Signal<TemplateRef<unknown>>;
  readonly $position: import('@angular/core').InputSignal<'left' | 'right'>;
  readonly $border: import('@angular/core').InputSignal<string>;
  readonly $padding: import('@angular/core').InputSignal<string>;
  readonly $width: import('@angular/core').InputSignal<string>;
  readonly $isOpen: import('@angular/core').ModelSignal<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<DrawerComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DrawerComponent,
    'tab-drawer',
    never,
    {
      $position: {
        alias: 'position';
        required: false;
        isSignal: true;
      };
      $border: {
        alias: 'border';
        required: false;
        isSignal: true;
      };
      $padding: {
        alias: 'padding';
        required: false;
        isSignal: true;
      };
      $width: {
        alias: 'width';
        required: true;
        isSignal: true;
      };
      $isOpen: {
        alias: 'isOpen';
        required: false;
        isSignal: true;
      };
    },
    {
      $isOpen: 'isOpenChange';
    },
    never,
    ['*'],
    false,
    never
  >;
}

export declare class DrawerContainerComponent {
  readonly $leftDrawer: import('@angular/core').Signal<DrawerComponent | undefined>;
  readonly $rightDrawer: import('@angular/core').Signal<DrawerComponent | undefined>;
  readonly $rightDrawerPositionExpression: import('@angular/core').Signal<string>;
  readonly $leftDrawerPositionExpression: import('@angular/core').Signal<string>;
  static ɵfac: i0.ɵɵFactoryDeclaration<DrawerContainerComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<DrawerContainerComponent, 'tab-drawer-container', never, {}, {}, ['$drawers'], ['*'], false, never>;
}

export declare class TableauUiDrawerModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiDrawerModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiDrawerModule,
    [typeof DrawerContainerComponent, typeof DrawerComponent],
    [typeof i3.CommonModule],
    [typeof DrawerContainerComponent, typeof DrawerComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiDrawerModule>;
}
