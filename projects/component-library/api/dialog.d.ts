// The public API of tableau-ui-angular/dialog, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { AfterContentInit, AfterViewInit, ApplicationRef, EnvironmentInjector, Injector, OnDestroy, Signal, TemplateRef, Type, ViewRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import * as i3 from 'tableau-ui-angular/button';

declare class ConfirmationDialogComponent implements AfterViewInit, AfterContentInit {
  ngAfterContentInit(): void;
  ngAfterViewInit(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ConfirmationDialogComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<ConfirmationDialogComponent, 'tab-confirmation-dialog', never, {}, {}, never, never, false, never>;
}

export declare class DialogRef<T = unknown> implements IDialogRef {
  readonly closed$: Observable<T | undefined>;
  close(result?: T): void;
  setResultWithoutClosing(result?: T): void;
}

export declare class DialogService implements OnDestroy {
  injector: Injector;
  appRef: ApplicationRef;
  environmentInjector: EnvironmentInjector;
  readonly $overlayHost: Signal<HTMLElement | null>;
  openModal<TComponent, TData, TResult>(component: Type<TComponent>, data: TData, args?: IModalArgs): DialogRef<TResult>;
  openTemplateModal<TContext, TResult>(contentTemplate: TemplateRef<TContext>, contentTemplateContext: TContext, args?: IModalArgs): DialogRef<TResult>;
  _openModal<TData, TResult>(getViewRef: (injector: Injector) => ViewRef, data: TData, args?: IModalArgs): DialogRef<TResult>;
  openConfirmationMessageDialog(
    title: string,
    message: string,
    color: 'error' | 'primary' | 'secondary',
    acceptBtnText: string | undefined,
    cancelBtnText: string | undefined,
    autofocus: 'accept' | 'cancel' | undefined,
    args?: IConfirmationDialogArgs,
  ): Promise<boolean>;
  openConfirmationTemplateDialog<TContext>(
    title: string,
    template: TemplateRef<TContext>,
    templateContext: TContext,
    color: 'error' | 'primary' | 'secondary',
    acceptBtnText: string | undefined,
    cancelBtnText: string | undefined,
    autofocus: 'accept' | 'cancel' | undefined,
    args?: IConfirmationDialogArgs,
  ): Promise<boolean>;
  readonly startZIndex = 100;
  readonly zIndexStep = 10;
  dialogStack: {
    dialogRef: IDialogRef;
    zIndex: number;
    args: IDialogArgs;
  }[];
  openTemplateDialog<TContext, TResult>(contentTemplate: TemplateRef<TContext>, args: IDialogArgs, contentTemplateContext: TContext, stackOptions?: StackOptions): DialogRef<TResult>;
  openDialog<TComponent, TData, TResult>(component: Type<TComponent>, data: TData, args?: IDialogArgs, stackOptions?: StackOptions): DialogRef<TResult>;
  escapeSubscription: Subscription | null;
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<DialogService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}

export declare class GlobalStackOptions {
  readonly referenceElement?: HTMLElement | undefined;
  constructor(referenceElement?: HTMLElement | undefined);
}

interface IConfirmationDialogArgs extends IDialogSizeArgs {
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

declare class IConfirmationDialogData<T = unknown> {
  content: string | undefined;
  contentTemplate: TemplateRef<T> | undefined;
  contentTemplateContext: T | undefined;
  color: 'error' | 'primary' | 'secondary';
  acceptBtnText: string | undefined;
  cancelBtnText: string | undefined;
  autofocus: 'accept' | 'cancel' | undefined;
}

interface IDialogArgs extends IModalArgs, IDialogPositionAndSizeArgs {
  skipCreatingBackdrop?: boolean;
  backdropCss?: Record<string, string>;
  containerCss?: Record<string, string>;
  trapFocus?: boolean;
}

interface IDialogHeaderArgs {
  title: string;
  allowClose: boolean;
}

interface IDialogPositionAndSizeArgs extends IDialogSizeArgs {
  top?: string | ((actualWidth: number, actualHeight: number, referenceElementRect?: DOMRect) => string | undefined);
  left?: string | ((actualWidth: number, actualHeight: number, referenceElementRect?: DOMRect) => string | undefined);
}

interface IDialogRef {
  closed$: Observable<unknown | undefined>;
  close: () => void;
}

interface IDialogSizeArgs {
  width?: string | ((referenceElementRect: DOMRect) => string | undefined);
  height?: string | ((referenceElementRect: DOMRect) => string | undefined);
  minWidth?: string | ((referenceElementRect: DOMRect) => string | undefined);
  minHeight?: string | ((referenceElementRect: DOMRect) => string | undefined);
  maxWidth?: string | ((referenceElementRect: DOMRect) => string | undefined);
  maxHeight?: string | ((referenceElementRect: DOMRect) => string | undefined);
}

interface IModalArgs extends IConfirmationDialogArgs {
  header?: IDialogHeaderArgs;
}

export declare class LocalStackOptions {
  readonly insertAfterElement: HTMLElement;
  readonly referenceElement?: HTMLElement | undefined;
  constructor(insertAfterElement: HTMLElement, referenceElement?: HTMLElement | undefined);
}

export type StackOptions = GlobalStackOptions | LocalStackOptions;

export declare class TableauUiDialogModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiDialogModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiDialogModule, [typeof ConfirmationDialogComponent], [typeof i2.CommonModule, typeof i3.TableauUiButtonModule], never>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiDialogModule>;
}

export declare function injectDialogData<T>(): T;

export declare function injectDialogRef<T>(): DialogRef<T>;

export type { IConfirmationDialogArgs, IDialogArgs, IDialogHeaderArgs, IDialogPositionAndSizeArgs, IDialogSizeArgs, IModalArgs };
