import type { ComponentRef, EmbeddedViewRef, TemplateRef, Type, ViewRef } from '@angular/core';
import { ApplicationRef, createComponent, EnvironmentInjector, inject, Injectable, Injector } from '@angular/core';
import type { DialogRef, IDialogRef } from './dialog.ref';
import { TAB_DIALOG_REF, DialogRefInternal } from './dialog.ref';
import type { IConfirmationDialogArgs, IDialogArgs, IDialogPositionAndSizeArgs, IModalArgs } from './dialog.args';
import { fromEvent, map, Subscription } from 'rxjs';
import type { FocusableElement } from 'tabbable';
import { tabbable } from 'tabbable';
import type { IConfirmationDialogData } from './confirmation-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { TAB_DATA_REF } from './data.ref';
import { IconComponent } from 'tableau-ui-angular/icon';
import type { StackOptions } from './stack-options';
import { GlobalStackOptions, LocalStackOptions } from './stack-options';

// Styles for the dialog container are in _dialog.service.scss in the styles folder
@Injectable({
  providedIn: 'root', // This service is a singleton and should be provided in the root injector
})
export class DialogService {
  injector = inject(Injector);
  appRef = inject(ApplicationRef);
  environmentInjector = inject(EnvironmentInjector);

  openModal<TComponent, TData, TResult>(component: Type<TComponent>, data: TData, args?: IModalArgs): DialogRef<TResult> {
    return this._openModal<TData, TResult>((injector: Injector) => this.createView(component, injector), data, args);
  }

  openTemplateModal<TContext, TResult>(contentTemplate: TemplateRef<TContext>, contentTemplateContext: TContext, args?: IModalArgs): DialogRef<TResult> {
    return this._openModal<TContext, TResult>((injector: Injector) => contentTemplate.createEmbeddedView(contentTemplateContext, injector), contentTemplateContext, args);
  }

  _openModal<TData, TResult>(getViewRef: (injector: Injector) => ViewRef, data: TData, args?: IModalArgs): DialogRef<TResult> {
    const a = {
      width: args?.width ?? '300px',
      height: args?.height ?? 'fit-content',
      maxWidth: args?.maxWidth ?? 'calc(100vw - 100px)',
      maxHeight: args?.maxHeight ?? 'calc(80vh - 50px)',
      closeOnBackdropClick: args?.closeOnBackdropClick ?? true,
      closeOnEscape: args?.closeOnEscape ?? true,
      backdropCss: {
        backgroundColor: 'var(--twc-modal-color-backdrop)',
      },
      containerCss: {
        backgroundColor: 'var(--twc-color-base)',
        borderColor: 'var(--twc-color-border-light)',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '1px',
        boxShadow: '0 2px 10px var(--twc-modal-color-box-shadow)',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
      },

      left(actualWidth) {
        return `calc(50vw - ${actualWidth / 2}px)`;
      },
      top(actualHeight) {
        return `calc(50vh - ${actualHeight / 2}px)`;
      },
      header: args?.header,
      trapFocus: true,
    } as IDialogArgs;

    const ref = this._openDialog<TData, TResult>(getViewRef, data, a);
    return ref;
  }

  async openConfirmationMessageDialog(
    title: string,
    message: string,
    color: 'error' | 'primary' | 'secondary',
    acceptBtnText: string | undefined,
    cancelBtnText: string | undefined,
    autofocus: 'accept' | 'cancel' | undefined,
    args?: IConfirmationDialogArgs,
  ): Promise<boolean> {
    const modalArgs = {
      ...(args ?? {}),
      header: { title, allowClose: true },
    } as IModalArgs;
    return new Promise(resolve => {
      const data: IConfirmationDialogData = {
        content: message,
        color,
        autofocus,
        acceptBtnText,
        cancelBtnText,
        contentTemplate: undefined,
        contentTemplateContext: undefined,
      };
      const dialogRef = this.openModal<ConfirmationDialogComponent, IConfirmationDialogData, boolean>(ConfirmationDialogComponent, data, modalArgs);
      dialogRef.closed$.subscribe(result => {
        resolve(result ?? false);
      });
    });
  }

  async openConfirmationTemplateDialog<TContext>(
    title: string,
    template: TemplateRef<TContext>,
    templateContext: TContext,
    color: 'error' | 'primary' | 'secondary',
    acceptBtnText: string | undefined,
    cancelBtnText: string | undefined,
    autofocus: 'accept' | 'cancel' | undefined,
    args?: IConfirmationDialogArgs,
  ): Promise<boolean> {
    const modalArgs = {
      ...(args ?? {}),
      header: { title, allowClose: true },
    } as IModalArgs;
    return new Promise(resolve => {
      const data: IConfirmationDialogData = {
        content: undefined,
        color,
        autofocus,
        acceptBtnText,
        cancelBtnText,
        contentTemplate: template,
        contentTemplateContext: templateContext,
      };

      const dialogRef = this.openModal<ConfirmationDialogComponent, IConfirmationDialogData, boolean>(ConfirmationDialogComponent, data, modalArgs);
      dialogRef.closed$.subscribe(result => {
        resolve(result ?? false);
      });
    });
  }

  readonly startZIndex = 100;
  readonly zIndexStep = 10;
  private readonly zIndex = this.startZIndex;

  dialogStack: {
    dialogRef: IDialogRef;
    zIndex: number;
    args: IDialogArgs;
  }[] = [];

  openTemplateDialog<TContext, TResult>(contentTemplate: TemplateRef<TContext>, args: IDialogArgs, contentTemplateContext: TContext, stackOptions: StackOptions = new GlobalStackOptions()) {
    return this._openDialog<TContext, TResult>((injector: Injector) => contentTemplate.createEmbeddedView(contentTemplateContext, injector), contentTemplateContext, args, stackOptions);
  }

  openDialog<TComponent, TData, TResult>(component: Type<TComponent>, data: TData, args: IDialogArgs = {}, stackOptions: StackOptions = new GlobalStackOptions()): DialogRef<TResult> {
    return this._openDialog<TData, TResult>((injector: Injector) => this.createView(component, injector), data, args, stackOptions);
  }
  private _openDialog<TData, TResult>(getViewRef: (injector: Injector) => ViewRef, data: TData, args: IDialogArgs = {}, stackOptions: StackOptions = new GlobalStackOptions()): DialogRef<TResult> {
    let trappedFocus:
      | {
          elements: {
            element: FocusableElement;
            originalTabIndex: number;
          }[];
          focusedElement: HTMLElement | null;
        }
      | undefined = undefined;
    // Before creating the dialog, trap focus
    // This means that we get all elements which are tabbable and set the tabindex to -1 for the duration of the popup
    if (args.trapFocus === true) {
      trappedFocus = this.trapFocus();
    }
    const dialogRef = new DialogRefInternal<TResult>();
    // calculate new zIndex
    let { zIndex } = this;
    if (this.dialogStack.length > 0) {
      zIndex = this.dialogStack[this.dialogStack.length - 1].zIndex + this.zIndexStep;
    }
    // push this dialog to the new stack
    this.dialogStack.push({ dialogRef, zIndex, args });

    // Set the backdrop
    const backdrop = this.createBackdrop(args, dialogRef, zIndex - 1, stackOptions);
    this.setEscapeHandler();

    // Create an injector that provides the DialogRef
    const injector = Injector.create({
      providers: [
        { provide: TAB_DIALOG_REF, useValue: dialogRef },
        { provide: TAB_DATA_REF, useValue: data },
      ],
      parent: this.injector,
    });

    // Create the component view
    const componentView = getViewRef(injector);
    // Attach component to the application
    this.appRef.attachView(componentView);

    // Create a container for the dialog
    const dialogElement = this.createDialogElement(componentView, args, injector, dialogRef, zIndex);
    dialogRef.dialogElement = dialogElement;

    // always insert element after the backdrop
    if (backdrop) {
      backdrop?.insertAdjacentElement('afterend', dialogElement);
    } else if (stackOptions instanceof LocalStackOptions) {
      stackOptions.insertAfterElement.insertAdjacentElement('afterend', dialogElement);
    } else {
      document.body.appendChild(dialogElement);
    }

    // Handle container position and window resize event
    dialogRef.reposition = (getArgs: (originalArgs: IDialogPositionAndSizeArgs) => void) => {
      getArgs(args);
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    };
    const resizeSubscription = DialogService.manageDialogPosition(dialogElement, args, stackOptions);

    // Handle dialog close
    dialogRef.closed$.subscribe(() => {
      if (resizeSubscription) {
        resizeSubscription.unsubscribe();
      }
      this.appRef.detachView(componentView);
      componentView.destroy();
      dialogElement.remove();

      const dialogIndex = this.dialogStack.findIndex(d => d.zIndex === zIndex);
      this.dialogStack.splice(dialogIndex, 1);
      // clear backdrop
      backdrop?.remove();
      // set escape handler
      this.setEscapeHandler();
      // restore focus to the elements that were trapped
      if (trappedFocus) {
        this.restoreFocus(trappedFocus);
      }
    });

    return dialogRef;
  }

  private createBackdrop(args: IDialogArgs, dialogRef: IDialogRef, dialogZIndex: number, stackOptions: StackOptions): HTMLDivElement | undefined {
    if (args.skipCreatingBackdrop === true) {
      return undefined;
    }
    const backdrop = document.createElement('div');
    backdrop.classList.add('dialog-backdrop');
    backdrop.style.zIndex = (dialogZIndex - 1).toString();
    if (args.backdropCss) {
      Object.keys(args.backdropCss).forEach(key => {
        (backdrop.style as unknown as Record<string, string>)[key] = args.backdropCss![key];
      });
    }
    if (stackOptions instanceof LocalStackOptions) {
      stackOptions.insertAfterElement.insertAdjacentElement('afterend', backdrop);
    } else {
      document.body.appendChild(backdrop);
    }
    if (args.closeOnBackdropClick === true) {
      backdrop.onclick = () => {
        dialogRef.close();
      };
    }
    return backdrop;
  }

  escapeSubscription: Subscription | null = null;
  private setEscapeHandler() {
    if (this.escapeSubscription) {
      this.escapeSubscription.unsubscribe();
      this.escapeSubscription = null;
    }
    if (this.dialogStack.length <= 0) {
      return;
    }
    // get the dialog to set the escape for
    const { dialogRef, args } = this.dialogStack[this.dialogStack.length - 1];
    if (args.closeOnEscape === true) {
      this.escapeSubscription = fromEvent(document, 'keydown')
        .pipe(map(e => e as KeyboardEvent))
        .subscribe((e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            if (this.escapeSubscription) {
              this.escapeSubscription.unsubscribe();
              this.escapeSubscription = null;
            }
            dialogRef.close();
            e.preventDefault();
          }
        });
    }
  }

  private createView<TComponent>(component: Type<TComponent>, injector: Injector): ViewRef {
    const componentRef: ComponentRef<TComponent> = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: injector,
    });
    return componentRef.hostView;
  }

  private createDialogElement(viewRef: ViewRef, args: IDialogArgs, injector: Injector, dialogRef: IDialogRef, zIndex: number): HTMLElement {
    const embeddedViewRef = viewRef as EmbeddedViewRef<unknown>;

    const dialogElement = document.createElement('div');
    dialogElement.classList.add('dialog-container');
    dialogElement.style.zIndex = zIndex.toString();
    for (const rootNode of embeddedViewRef.rootNodes) {
      dialogElement.appendChild(rootNode as Node);
    }

    if (args.containerCss) {
      Object.keys(args.containerCss).forEach(key => {
        (dialogElement.style as unknown as Record<string, string>)[key] = args.containerCss![key];
      });
    }
    if (args.header) {
      const headerElement = document.createElement('div');
      headerElement.classList.add('dialog-header');
      const titleElement = document.createElement('div');
      titleElement.classList.add('dialog-title');
      titleElement.innerHTML = args.header.title;
      headerElement.appendChild(titleElement);
      if (args.header.allowClose) {
        const iconRef: ComponentRef<IconComponent> = createComponent(IconComponent, {
          environmentInjector: this.environmentInjector,
          elementInjector: injector,
        });
        const iconElement = (iconRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
        iconElement.textContent = 'close';
        iconElement.setAttribute('tabindex', '0');
        iconElement.addEventListener('click', () => {
          dialogRef.close();
        });
        iconElement.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            dialogRef.close();
            e.preventDefault();
          }
        });
        this.appRef.attachView(iconRef.hostView);
        headerElement.appendChild(iconElement);
      }
      dialogElement.insertBefore(headerElement, dialogElement.firstChild);
    }
    return dialogElement;
  }

  private static manageDialogPosition(dialogElement: HTMLElement, args: IDialogPositionAndSizeArgs, stackOptions: StackOptions): Subscription | null {
    // Temporarily position the dialog offscreen to get its dimensions
    dialogElement.style.top = '-9999px';
    dialogElement.style.left = '-9999px';

    setTimeout(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    }, 10);

    let resizeSubscription: Subscription | null = null;

    // Handle window resize event
    resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    });

    // Monitor changes to the size of the dialog
    const resizeObserver = new ResizeObserver(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    });

    // Start observing the dialog element
    resizeObserver.observe(dialogElement);

    // Monitor changes to the size of the insertAfterElement
    const insertAfterResizeObserver = new ResizeObserver(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    });
    // Start observing the referenceElement if it exists
    const referenceElement = this.getReferenceElement(stackOptions);
    if (referenceElement) {
      insertAfterResizeObserver.observe(referenceElement);
    }
    // Return a subscription-like object that also disconnects the observer
    return new Subscription(() => {
      resizeObserver.disconnect();
      resizeSubscription?.unsubscribe();
      insertAfterResizeObserver.disconnect();
    });
  }
  private static getReferenceElement(stackOptions: StackOptions): HTMLElement | undefined {
    if (stackOptions instanceof LocalStackOptions) {
      return stackOptions.referenceElement ?? stackOptions.insertAfterElement;
    } else if (stackOptions instanceof GlobalStackOptions) {
      return stackOptions.referenceElement;
    }
    return undefined;
  }
  private static calculateAndSetPosition(dialogElement: HTMLElement, args: IDialogPositionAndSizeArgs, stackOptions: StackOptions) {
    const referenceElement = this.getReferenceElement(stackOptions);
    const referenceElementRect = referenceElement?.getBoundingClientRect();
    const getWidthHeight = (name: string, defaultValue: string, value: string | ((referenceElementRect: DOMRect) => string | undefined) | undefined) => {
      if (value === undefined) {
        return defaultValue;
      } else if (typeof value === 'function') {
        if (!referenceElementRect) {
          throw new Error(`When using a function for ${name}, insertAfterElement must be provided.`);
        }
        return value(referenceElementRect) ?? defaultValue;
      } else {
        return value;
      }
    };

    dialogElement.style.minWidth = getWidthHeight('minWidth', 'auto', args.minWidth);
    dialogElement.style.minHeight = getWidthHeight('minHeight', '0', args.minHeight);
    dialogElement.style.width = getWidthHeight('width', 'fit-content', args.width);
    dialogElement.style.height = getWidthHeight('height', 'fit-content', args.height);
    dialogElement.style.maxWidth = getWidthHeight('maxWidth', 'none', args.maxWidth);
    dialogElement.style.maxHeight = getWidthHeight('maxHeight', 'none', args.maxHeight);

    dialogElement.style.overflowX = 'hidden';
    dialogElement.style.overflowY = 'hidden';
    const actualWidth = dialogElement.offsetWidth;
    const actualHeight = dialogElement.offsetHeight;

    const getTopLeft = (name: string, value: string | ((actualWidth: number, actualHeight: number, referenceElementRect?: DOMRect) => string | undefined) | undefined) => {
      if (value === undefined) {
        return 'auto';
      } else if (typeof value === 'function') {
        return value(actualWidth, actualHeight, referenceElementRect) ?? 'auto';
      } else {
        return value;
      }
    };
    dialogElement.style.top = getTopLeft('top', args.top);
    dialogElement.style.left = getTopLeft('left', args.left);

    // if dialog is higher than the available page height, set it to scroll
    if (actualHeight + dialogElement.offsetTop > window.innerHeight) {
      dialogElement.style.height = `calc(100vh - ${dialogElement.offsetTop}px)`;
      dialogElement.style.overflowY = 'auto';
    }
    // if dialog is wider than the available page width, set it to scroll
    if (actualWidth + dialogElement.offsetLeft > window.innerWidth) {
      dialogElement.style.width = `calc(100vw - ${dialogElement.offsetLeft}px)`;
      dialogElement.style.overflowX = 'auto';
    }
  }

  private trapFocus(): {
    elements: {
      element: FocusableElement;
      originalTabIndex: number;
    }[];
    focusedElement: HTMLElement | null;
  } {
    const tabbableElements = tabbable(document.body);
    const elementsTable = tabbableElements.map(e => ({
      element: e,
      originalTabIndex: e.tabIndex,
    }));
    elementsTable.forEach(e => (e.element.tabIndex = -1));
    const focusedElement = document.activeElement as HTMLElement | null;
    if (focusedElement) {
      focusedElement.blur();
    }
    return {
      elements: elementsTable,
      focusedElement: focusedElement,
    };
  }
  private restoreFocus(obj: {
    elements: {
      element: FocusableElement;
      originalTabIndex: number;
    }[];
    focusedElement: HTMLElement | null;
  }) {
    obj.elements.forEach(e => (e.element.tabIndex = e.originalTabIndex));
    if (obj.focusedElement) {
      obj.focusedElement.focus();
    }
  }
}
