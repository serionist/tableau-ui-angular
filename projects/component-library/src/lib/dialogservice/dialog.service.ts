import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    createComponent,
    EnvironmentInjector,
    inject,
    Injectable,
    Injector,
    TemplateRef,
    Type,
    ViewContainerRef,
    ViewRef,
} from '@angular/core';
import { TAB_DIALOG_REF, DialogRef } from './dialog.ref';
import {
    IConfirmationDialogArgs,
    IDialogArgs,
    IDialogHeaderArgs,
    IDialogPositionAndSizeArgs,
    IModalArgs,
} from './dialog.args';
import { debounceTime, fromEvent, map, Subscription, zip } from 'rxjs';
import { FocusableElement, tabbable } from 'tabbable';
import { IconComponent } from '../icon/icon.component';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { TableauUiDialogModule } from './tableau-ui-dialog.module';
import { TemplateDialogComponent } from './template-dialog.component';

// Styles for the dialog container are in _dialog.service.scss in the styles folder
@Injectable({
    providedIn: TableauUiDialogModule,
})
export class DialogService {
    injector = inject(Injector);
    appRef = inject(ApplicationRef);
    environmentInjector = inject(EnvironmentInjector);

    openModal<T>(
        component: Type<T>,
        inputs: { [key: string]: any } = {},
        args?: IModalArgs
    ): DialogRef {
        const a = {
            width: args?.width ?? '300px',
            height: args?.height ?? 'fit-content',
            maxWidth: args?.maxWidth ?? 'calc(100vw - 100px)',
            maxHeight: args?.maxHeight ?? 'calc(80vh - 50px)',
            closeOnBackdropClick: args?.closeOnBackdropClick ?? true,
            closeOnEscape: args?.closeOnEscape ?? true,
            backdropCss: {
                backgroundColor: 'rgb(245, 245, 245, 0.33)',
            },
            containerCss: {
                backgroundColor: 'rgb(255, 255, 255)',
                borderColor: 'rgb(212, 212, 212)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderRadius: '1px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
            },
            left(actualWidth, actualHeight) {
                return `calc(50vw - ${actualWidth / 2}px)`;
            },
            top(actualWidth, actualHeight) {
                return `calc(50vh - ${actualHeight / 2}px)`;
            },
            header: args?.header,
            trapFocus: true
        } as IDialogArgs;
        
        const ref = this.openDialog(component, inputs, a);
        return ref;
    }

    openConfirmationMessageDialog(
        title: string,
        message: string,
        color: 'primary' | 'error' | 'secondary',
        acceptBtnText: string | undefined,
        cancelBtnText: string | undefined,
        autofocus: 'accept' | 'cancel' | undefined,
        args?: IConfirmationDialogArgs
    ): Promise<boolean> {
        const modalArgs = {
            ...(args ?? {}),
            header: { title, allowClose: true },
        } as IModalArgs;
        return new Promise((resolve) => {
            const inputs: { [key: string]: any } = {
                content: message,
                color,
                autofocus,
            };
            if (acceptBtnText) inputs['acceptBtnText'] = acceptBtnText;
            if (cancelBtnText) inputs['cancelBtnText'] = cancelBtnText;
            const dialogRef = this.openModal(
                ConfirmationDialogComponent,
                inputs,
                modalArgs
            );
            dialogRef.afterClosed$.subscribe((result) => {
                resolve(result ?? false);
            });
        });
    }

    openConfirmationTemplateDialog(
        title: string,
        template: TemplateRef<any>,
        color: 'primary' | 'error' | 'secondary',
        acceptBtnText: string | undefined,
        cancelBtnText: string | undefined,
        autofocus: 'accept' | 'cancel' | undefined,
        args?: IConfirmationDialogArgs
    ): Promise<boolean> {
        const modalArgs = {
            ...(args ?? {}),
            header: { title, allowClose: true },
        } as IModalArgs;
        return new Promise((resolve) => {
            const inputs: { [key: string]: any } = {
                contentTemplate: template,
                color,
                autofocus,
            };
            if (acceptBtnText) inputs['acceptBtnText'] = acceptBtnText;
            if (cancelBtnText) inputs['cancelBtnText'] = cancelBtnText;
            const dialogRef = this.openModal(
                ConfirmationDialogComponent,
                inputs,
                modalArgs
            );
            dialogRef.afterClosed$.subscribe((result) => {
                resolve(result ?? false);
            });
        });
    }

    readonly startZIndex = 100;
    readonly zIndexStep = 10;
    private zIndex = this.startZIndex;

    dialogStack: {
        dialogRef: DialogRef;
        zIndex: number;
        args: IDialogArgs;
    }[] = [];

    openTemplateDialog<T extends any = any>(
        contentTemplate: TemplateRef<T>,
        args: IDialogArgs,
        contentTemplateContext?: T,
        insertAfterElement?: HTMLElement
    ) {
        const inputs: { [key: string]: any } = {
            contentTemplate,
            contentTemplateContext,
        };
        return this.openDialog(
            TemplateDialogComponent,
            inputs,
            args,
            insertAfterElement
        );
    }
    openDialog<T>(
        component: Type<T>,
        inputs: { [key: string]: any } = {},
        args: IDialogArgs = {},
        insertAfterElement?: HTMLElement
    ): DialogRef {

        let trappedFocus:{
            elements: {
                element: FocusableElement;
                originalTabIndex: number;
            }[];
            focusedElement: HTMLElement | null;
        } | undefined = undefined;
        // Before creating the dialog, trap focus
        // This means that we get all elements which are tabbable and set the tabindex to -1 for the duration of the popup
        if (args.trapFocus) {
            trappedFocus = this.trapFocus();
        }
        const dialogRef = new DialogRef();
        // calculate new zIndex
        let zIndex = this.zIndex;
        if (this.dialogStack.length > 0) {
            zIndex =
                this.dialogStack[this.dialogStack.length - 1].zIndex +
                this.zIndexStep;
        }
        // push this dialog to the new stack
        this.dialogStack.push({ dialogRef, zIndex, args });

        // Set the backdrop
        this.setBackdropAndEscape();

        // Create an injector that provides the DialogRef
        const injector = Injector.create({
            providers: [{ provide: TAB_DIALOG_REF, useValue: dialogRef }],
            parent: this.injector,
        });

        // Create the component view
        const componentView = this.createView(component, inputs, injector);
        // Attach component to the application
        this.appRef.attachView(componentView);

        // Create a container for the dialog
        const dialogElement = this.createDialogElement(
            componentView,
            args,
            injector,
            dialogRef,
            zIndex
        );
        dialogRef.dialogElement = dialogElement;

        if (insertAfterElement) {
            insertAfterElement.insertAdjacentElement('afterend', dialogElement);
        } else {
            document.body.appendChild(dialogElement);
        }
        // Handle container position and window resize event
        dialogRef.reposition = (getArgs: (originalArgs: IDialogPositionAndSizeArgs) => void) => {
            getArgs(args);
            DialogService.calculateAndSetPosition(dialogElement, args);
        }
        const resizeSubscription = this.manageDialogPosition(dialogElement, args);


        // Handle dialog close
        dialogRef.afterClosed$.subscribe(() => {
            if (resizeSubscription) {
                resizeSubscription.unsubscribe();
            }
            this.appRef.detachView(componentView);
            componentView.destroy();
            dialogElement.remove();

            
            const dialogIndex = this.dialogStack.findIndex(
                (d) => d.zIndex === zIndex
            );
            this.dialogStack.splice(dialogIndex, 1);
            this.setBackdropAndEscape();
            // restore focus to the elements that were trapped
            if (trappedFocus) {
                this.restoreFocus(trappedFocus);
            }
        });

        return dialogRef;
    }

    // Moves the backdrop behind the topmost dialog
    // called when a dialog is created/destroyed
    // create or destroy the backdrop as needed
    backdrop: HTMLDivElement | null = null;
    escapeSubscription: Subscription | null = null;
    private setBackdropAndEscape() {
        // remove backdrop if needed
        if (this.dialogStack.length <= 0) {
            this.backdrop?.remove();
            this.backdrop = null;
            return;
        } else if (!this.backdrop) {
            // create backdrop if needed
            this.backdrop = document.createElement('div');
            this.backdrop.classList.add('dialog-backdrop');
            document.body.appendChild(this.backdrop);
        }
        // reset the custom css for the backdrop
        this.backdrop.style.cssText = '';
        // get the dialog to set the backdrop for
        const { dialogRef, zIndex, args } =
            this.dialogStack[this.dialogStack.length - 1];

        // set the zIndex of the backdrop
        this.backdrop.style.zIndex = (zIndex - 1).toString();

        if (args.backdropCss) {
            Object.keys(args.backdropCss).forEach((key) => {
                (this.backdrop!.style as any)[key] = args.backdropCss![key];
            });
        }
        if (args.closeOnBackdropClick) {
            this.backdrop.onclick = () => dialogRef.close();
        }

        if (this.escapeSubscription) {
            this.escapeSubscription.unsubscribe();
            this.escapeSubscription = null;
        }
        if (args.closeOnEscape) {
            this.escapeSubscription = fromEvent(document, 'keydown')
                .pipe(map((e) => e as KeyboardEvent))
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

    private createView<T>(
        component: Type<T>,
        inputs: { [key: string]: any } = {},
        injector: Injector
    ): ViewRef {
        const componentRef: ComponentRef<T> = createComponent(component, {
            environmentInjector: this.environmentInjector,
            elementInjector: injector,
        });
        // Set inputs on the component
        // They can be either static or function (signals)
        const instance = componentRef.instance as any;
        Object.keys(inputs).forEach((key) => {
            if (typeof instance[key]?.set === 'function') {
                instance[key].set(inputs[key]);
            } else {
                instance[key] = inputs[key];
            }
        });
        return componentRef.hostView;
    }

    private createDialogElement(
        viewRef: ViewRef,
        args: IDialogArgs,
        injector: Injector,
        dialogRef: DialogRef,
        zIndex: number
    ): HTMLElement {
        const dialogElement = (viewRef as any).rootNodes[0] as HTMLElement;
        dialogElement.classList.add('dialog-container');
        dialogElement.style.zIndex = zIndex.toString();
       
        if (args.containerCss) {
            Object.keys(args.containerCss).forEach((key) => {
                (dialogElement.style as any)[key] = args.containerCss![key];
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
                const iconRef: ComponentRef<IconComponent> = createComponent(
                    IconComponent,
                    {
                        environmentInjector: this.environmentInjector,
                        elementInjector: injector,
                    }
                );
                const iconElement = (iconRef.hostView as any)
                    .rootNodes[0] as HTMLElement;
                iconElement.textContent = 'close';
                iconElement.setAttribute('tabindex', '0');
                iconElement.addEventListener('click', () => dialogRef.close());
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

   
   private manageDialogPosition(
    dialogElement: HTMLElement,
    args: IDialogPositionAndSizeArgs
): Subscription | null {
    // Temporarily position the dialog offscreen to get its dimensions
    dialogElement.style.top = '-9999px';
    dialogElement.style.left = '-9999px';

    setTimeout(() => {
        DialogService.calculateAndSetPosition(dialogElement, args);
    }, 10);

    let resizeSubscription: Subscription | null = null;

    // Handle window resize event
    resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
        DialogService.calculateAndSetPosition(dialogElement, args);
    });

    // Monitor changes to the size of the dialog
    const resizeObserver = new ResizeObserver(() => {
        DialogService.calculateAndSetPosition(dialogElement, args);
    });

    // Start observing the dialog element
    resizeObserver.observe(dialogElement);

    // Return a subscription-like object that also disconnects the observer
    return new Subscription(() => {
        resizeObserver.disconnect();
        resizeSubscription?.unsubscribe();
    });
}

    private static calculateAndSetPosition(dialogElement: HTMLElement, args: IDialogPositionAndSizeArgs) {
      
        if (args.maxWidth)  {
            dialogElement.style.maxWidth = args.maxWidth;
        }
        if (args.maxHeight) {
            dialogElement.style.maxHeight = args.maxHeight;
        }
        dialogElement.style.overflowX = 'hidden';
        dialogElement.style.overflowY = 'hidden';
        dialogElement.style.height = args.height ?? 'fit-content';
        dialogElement.style.width = args.width ?? 'fit-content';

        const actualWidth = dialogElement.offsetWidth;
        const actualHeight = dialogElement.offsetHeight;

        if (typeof args.top === 'function') {
            dialogElement.style.top = args.top(actualWidth, actualHeight);
        } else if (typeof args.top === 'string') {
            dialogElement.style.top = args.top;
        }

        if (typeof args.left === 'function') {
            dialogElement.style.left = args.left(actualWidth, actualHeight);
        } else if (typeof args.left === 'string') {
            dialogElement.style.left = args.left;
        }

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
        const elementsTable = tabbableElements.map((e) => ({
            element: e,
            originalTabIndex: e.tabIndex,
        }));
        elementsTable.forEach((e) => (e.element.tabIndex = -1));
        const focusedElement = document.activeElement as HTMLElement;
        if (focusedElement) {
            focusedElement.blur();
        }
        return {
            elements: elementsTable,
            focusedElement: focusedElement,
        };
    }
    private restoreFocus(
        obj: {
            elements: {
                element: FocusableElement;
                originalTabIndex: number;
            }[];
            focusedElement: HTMLElement | null;
        }
    ) {
        obj.elements.forEach((e) => (e.element.tabIndex = e.originalTabIndex));
        if (obj.focusedElement) {
            obj.focusedElement.focus();
        }
    }
}
