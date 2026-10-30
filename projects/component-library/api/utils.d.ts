// The public API of tableau-ui-angular/utils, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i0 from '@angular/core';
import { ElementRef, OnDestroy } from '@angular/core';

export declare class ResizeWatcherDirective implements OnDestroy {
  readonly element: ElementRef<HTMLElement>;
  readonly resized: import('@angular/core').OutputEmitterRef<{
    currentElement: ElementRef;
    entries: ResizeObserverEntry[];
  }>;
  constructor();
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ResizeWatcherDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ResizeWatcherDirective,
    '[resizeWatcher]',
    never,
    {},
    {
      resized: 'resized';
    },
    never,
    never,
    false,
    never
  >;
}

export declare class TableauUiUtilsModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiUtilsModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiUtilsModule, [typeof ResizeWatcherDirective], never, [typeof ResizeWatcherDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiUtilsModule>;
}

export declare function generateRandomString(length?: number): string;
