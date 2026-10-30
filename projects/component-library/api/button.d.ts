// The public API of tableau-ui-angular/button, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { ElementRef } from '@angular/core';

export declare class ButtonComponent {
  readonly $nativeElement: ElementRef<HTMLElement>;
  constructor();
  readonly $disabled: import('@angular/core').InputSignal<boolean>;
  readonly $loading: import('@angular/core').InputSignal<boolean>;
  readonly $tabindex: import('@angular/core').InputSignal<string>;
  readonly $type: import('@angular/core').InputSignal<'button' | 'submit'>;
  readonly $kind: import('@angular/core').InputSignal<'stroked' | 'raised'>;
  readonly $color: import('@angular/core').InputSignal<'error' | 'plain' | 'primary' | 'secondary'>;
  readonly $layout: import('@angular/core').InputSignal<'default' | 'icon' | 'small-icon'>;
  readonly $inline: import('@angular/core').InputSignal<boolean>;
  readonly $noFocusOnClick: import('@angular/core').InputSignal<boolean>;
  handleKeydown(event: KeyboardEvent): void;
  handleMouseDown(): void;
  handlePointerDown(): void;
  handleTouchStart(): void;
  mouseClickHandler(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ButtonComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ButtonComponent,
    'button:not([tab-menu-button]),a[button]:not([tab-menu-button])',
    never,
    {
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $loading: {
        alias: 'loading';
        required: false;
        isSignal: true;
      };
      $tabindex: {
        alias: 'tabindex';
        required: false;
        isSignal: true;
      };
      $type: {
        alias: 'type';
        required: false;
        isSignal: true;
      };
      $kind: {
        alias: 'kind';
        required: false;
        isSignal: true;
      };
      $color: {
        alias: 'color';
        required: false;
        isSignal: true;
      };
      $layout: {
        alias: 'layout';
        required: false;
        isSignal: true;
      };
      $inline: {
        alias: 'inline';
        required: false;
        isSignal: true;
      };
      $noFocusOnClick: {
        alias: 'noFocusOnClick';
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

export declare class TableauUiButtonModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiButtonModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiButtonModule, [typeof ButtonComponent], [typeof i2.CommonModule], [typeof ButtonComponent]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiButtonModule>;
}
