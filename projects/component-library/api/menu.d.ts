// The public API of tableau-ui-angular/menu, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i0 from '@angular/core';
import { ElementRef, InputSignal, ModelSignal, OnDestroy, Signal, TemplateRef } from '@angular/core';
import * as i4 from 'tableau-ui-angular/dialog';
import { DialogRef } from 'tableau-ui-angular/dialog';

export declare class AttachedMenuDirective {
  readonly $menu: import('@angular/core').InputSignal<MenuDirective>;
  readonly $autoOpenClose: import('@angular/core').InputSignal<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<AttachedMenuDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AttachedMenuDirective,
    '[attachedMenu]',
    never,
    {
      $menu: {
        alias: 'attachedMenu';
        required: true;
        isSignal: true;
      };
      $autoOpenClose: {
        alias: 'autoOpenClose';
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

export declare class ButtonMenuDirective extends MenuDirective {
  readonly $menuContainerCss: ModelSignal<Record<string, string>>;
  readonly $closeOnBackdropClick: InputSignal<boolean>;
  readonly $minWidth: ModelSignal<string | 'fit-content' | 'parentWidth'>;
  readonly $width: ModelSignal<string | 'fit-content' | 'parentWidth'>;
  static ɵfac: i0.ɵɵFactoryDeclaration<ButtonMenuDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ButtonMenuDirective,
    'ng-template[buttonMenu]',
    ['buttonMenu'],
    {
      $menuContainerCss: {
        alias: 'menuContainerCss';
        required: false;
        isSignal: true;
      };
      $closeOnBackdropClick: {
        alias: 'closeOnBackdropClick';
        required: false;
        isSignal: true;
      };
      $minWidth: {
        alias: 'minWidth';
        required: false;
        isSignal: true;
      };
      $width: {
        alias: 'width';
        required: false;
        isSignal: true;
      };
    },
    {
      $menuContainerCss: 'menuContainerCssChange';
      $closeOnBackdropClick: 'closeOnBackdropClickChange';
      $minWidth: 'minWidthChange';
      $width: 'widthChange';
    },
    never,
    never,
    false,
    never
  >;
}

export declare class MenuDirective implements OnDestroy {
  readonly template: TemplateRef<unknown>;
  readonly $parentControl: ModelSignal<ElementRef<HTMLElement> | undefined>;
  readonly $menuContainerCss: ModelSignal<Record<string, string>>;
  readonly $backdropCss: ModelSignal<Record<string, string>>;
  readonly $minWidth: import('@angular/core').InputSignal<string>;
  readonly $width: import('@angular/core').InputSignal<string>;
  readonly $maxWidth: import('@angular/core').InputSignal<string>;
  readonly $minHeight: import('@angular/core').InputSignal<string>;
  readonly $height: import('@angular/core').InputSignal<string>;
  readonly $maxHeight: import('@angular/core').InputSignal<string>;
  readonly $closeOnBackdropClick: import('@angular/core').InputSignal<boolean>;
  readonly $closeOnEscape: import('@angular/core').InputSignal<boolean>;
  readonly $trapFocus: import('@angular/core').InputSignal<boolean>;
  readonly $menuLocation: import('@angular/core').InputSignal<'bottom' | 'left' | 'right' | 'top'>;
  get $openDialog(): Signal<DialogRef | undefined>;
  readonly opened: import('@angular/core').OutputEmitterRef<DialogRef<unknown>>;
  readonly closed: import('@angular/core').OutputEmitterRef<void>;
  open(forceReOpen?: boolean): DialogRef<unknown> | undefined;
  close(): void;
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<MenuDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MenuDirective,
    'ng-template[menu]',
    ['menu'],
    {
      $parentControl: {
        alias: '$parentControl';
        required: false;
        isSignal: true;
      };
      $menuContainerCss: {
        alias: 'menuContainerCss';
        required: false;
        isSignal: true;
      };
      $backdropCss: {
        alias: 'backdropCss';
        required: false;
        isSignal: true;
      };
      $minWidth: {
        alias: 'minWidth';
        required: false;
        isSignal: true;
      };
      $width: {
        alias: 'width';
        required: false;
        isSignal: true;
      };
      $maxWidth: {
        alias: 'maxWidth';
        required: false;
        isSignal: true;
      };
      $minHeight: {
        alias: 'minHeight';
        required: false;
        isSignal: true;
      };
      $height: {
        alias: 'height';
        required: false;
        isSignal: true;
      };
      $maxHeight: {
        alias: 'maxHeight';
        required: false;
        isSignal: true;
      };
      $closeOnBackdropClick: {
        alias: 'closeOnBackdropClick';
        required: false;
        isSignal: true;
      };
      $closeOnEscape: {
        alias: 'closeOnEscape';
        required: false;
        isSignal: true;
      };
      $trapFocus: {
        alias: 'trapFocus';
        required: false;
        isSignal: true;
      };
      $menuLocation: {
        alias: 'menuLocation';
        required: false;
        isSignal: true;
      };
    },
    {
      $parentControl: '$parentControlChange';
      $menuContainerCss: 'menuContainerCssChange';
      $backdropCss: 'backdropCssChange';
      opened: 'opened';
      closed: 'closed';
    },
    never,
    never,
    false,
    never
  >;
}

export declare class TableauUiMenuModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiMenuModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiMenuModule,
    [typeof MenuDirective, typeof AttachedMenuDirective, typeof ButtonMenuDirective],
    [typeof i4.TableauUiDialogModule],
    [typeof MenuDirective, typeof AttachedMenuDirective, typeof ButtonMenuDirective]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiMenuModule>;
}
