// The public API of tableau-ui-angular/tooltip, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i4 from '@angular/common';
import * as i0 from '@angular/core';
import { ModelSignal, OnDestroy, TemplateRef } from '@angular/core';
import * as i3 from 'tableau-ui-angular/dialog';

export declare class TableauUiTooltipModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiTooltipModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiTooltipModule,
    [typeof TooltipDirective, typeof TooltipComponent],
    [typeof i3.TableauUiDialogModule, typeof i4.CommonModule],
    [typeof TooltipDirective]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiTooltipModule>;
}

export interface TooltipArgs<T> {
  template: TemplateRef<T | undefined> | string | null | undefined;
  context: T | undefined;
  position?: 'bottom' | 'left' | 'right' | 'top';
  margin?: string;
  padding?: string;
}

declare class TooltipComponent<T> {
  readonly dialogData: TooltipComponentArgs<T>;
  readonly stringTooltip: string | undefined;
  readonly templateTooltip: TemplateRef<T> | undefined;
  constructor();
  static ɵfac: i0.ɵɵFactoryDeclaration<TooltipComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<TooltipComponent<any>, 'tab-tooltip', never, {}, {}, never, never, false, never>;
}

interface TooltipComponentArgs<T> {
  tooltip: TemplateRef<T> | string;
  tooltipContext: T;
  padding: string;
}

export declare class TooltipDirective<T> implements OnDestroy {
  readonly $tooltip: ModelSignal<TemplateRef<T | undefined> | string | null | undefined>;
  readonly $tooltipContext: ModelSignal<T | undefined>;
  readonly $tooltipPosition: ModelSignal<'bottom' | 'left' | 'right' | 'top'>;
  readonly $tooltipMargin: ModelSignal<string>;
  readonly $tooltipPadding: ModelSignal<string>;
  readonly $tooltipArgsMode: import('@angular/core').InputSignal<'full' | 'individual' | 'lazy'>;
  readonly $tooltipFullArgs: import('@angular/core').InputSignal<TooltipArgs<T> | undefined>;
  readonly $tooltipLazyArgs: import('@angular/core').InputSignal<(() => TooltipArgs<T> | undefined) | undefined>;
  onMouseEnter(e: MouseEvent): void;
  onMouseLeave(): void;
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<TooltipDirective<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TooltipDirective<any>,
    '[tooltip]',
    never,
    {
      $tooltip: {
        alias: 'tooltip';
        required: true;
        isSignal: true;
      };
      $tooltipContext: {
        alias: 'tooltipContext';
        required: false;
        isSignal: true;
      };
      $tooltipPosition: {
        alias: 'tooltipPosition';
        required: false;
        isSignal: true;
      };
      $tooltipMargin: {
        alias: 'tooltipMargin';
        required: false;
        isSignal: true;
      };
      $tooltipPadding: {
        alias: 'tooltipPadding';
        required: false;
        isSignal: true;
      };
      $tooltipArgsMode: {
        alias: 'tooltipArgsMode';
        required: false;
        isSignal: true;
      };
      $tooltipFullArgs: {
        alias: 'tooltipFullArgs';
        required: false;
        isSignal: true;
      };
      $tooltipLazyArgs: {
        alias: 'tooltipLazyArgs';
        required: false;
        isSignal: true;
      };
    },
    {
      $tooltip: 'tooltipChange';
      $tooltipContext: 'tooltipContextChange';
      $tooltipPosition: 'tooltipPositionChange';
      $tooltipMargin: 'tooltipMarginChange';
      $tooltipPadding: 'tooltipPaddingChange';
    },
    never,
    never,
    false,
    never
  >;
}

export {};
