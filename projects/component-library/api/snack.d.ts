// The public API of tableau-ui-angular/snack, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { TemplateRef, Type } from '@angular/core';
import { Observable } from 'rxjs';
import * as i3 from 'tableau-ui-angular/icon';

interface ISnackRef {
  closed$: Observable<unknown | undefined>;
  close: () => void;
}

declare class SnackComponent<TContext> {
  static ɵfac: i0.ɵɵFactoryDeclaration<SnackComponent<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<SnackComponent<any>, 'tab-snack', never, {}, {}, never, never, false, never>;
}

interface SnackComponentData<TContext> {
  type: 'error' | 'info' | 'success';
  message: string | undefined;
  actionLink?: string | undefined;
  action?: ((s: SnackRef<boolean>) => void) | undefined;
  contentTemplate: TemplateRef<TContext> | undefined;
  contentTemplateContext: TContext | undefined;
}

export declare class SnackRef<T = unknown> implements ISnackRef {
  readonly closed$: Observable<T | undefined>;
  close(result?: T): void;
  setResultWithoutClosing(result?: T): void;
}

export declare class SnackService {
  openSnack(message: string, duration?: number | undefined, type?: 'error' | 'info' | 'success', location?: 'bottom' | 'top'): SnackRef<boolean>;
  openSnackWithAction(
    message: string,
    actionLabel: string,
    action: (s: SnackRef<boolean>) => void,
    duration?: number | undefined,
    type?: 'error' | 'info' | 'success',
    location?: 'bottom' | 'top',
  ): SnackRef<boolean>;
  openSnackFromTemplate<TContext>(
    template: TemplateRef<TContext>,
    templateContext?: TContext,
    duration?: number | undefined,
    type?: 'error' | 'info' | 'success',
    location?: 'bottom' | 'top',
  ): SnackRef<boolean>;
  openSnackComponent<TComponent, TData, TResult>(
    component: Type<TComponent>,
    data: TData,
    duration?: number | undefined,
    type?: 'error' | 'info' | 'success',
    location?: 'bottom' | 'top',
  ): SnackRef<TResult>;
  static ɵfac: i0.ɵɵFactoryDeclaration<SnackService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}

export declare class TableauUiSnackModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiSnackModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiSnackModule, [typeof SnackComponent], [typeof i2.CommonModule, typeof i3.TableauUiIconModule], never>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiSnackModule>;
}

export declare function injectSnackData<T>(): T;

export declare function injectSnackRef<T>(): SnackRef<T>;

export {};
