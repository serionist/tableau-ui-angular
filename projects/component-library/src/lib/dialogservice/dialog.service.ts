import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    createComponent,
    EnvironmentInjector,
    inject,
    Injectable,
    Injector,
    Type,
    ViewContainerRef,
    ViewRef
} from '@angular/core';
import { TAB_DIALOG_REF, DialogRef } from './dialog.ref';
import { IConfirmationDialogArgs, IDialogArgs, IDialogHeaderArgs, IModalArgs } from './dialog.args';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { FocusableElement, tabbable } from 'tabbable';
import { IconComponent } from '../icon/icon.component';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    constructor(private injector: Injector, private appRef: ApplicationRef, private environmentInjector: EnvironmentInjector) {}

    openModal<T>(component: Type<T>, inputs: { [key: string]: any } = {}, args?: IModalArgs): DialogRef {
        const a = {
            width: args?.width ?? '300px',
            height: args?.height ?? 'fit-content',
            maxWidth: args?.maxWidth ?? 'calc(100vw - 100px)',
            maxHeight: args?.maxHeight ?? 'calc(80vh - 50px)',
            closeOnBackdropClick: args?.closeOnBackdropClick ?? true,
            backdropCss: {
                backgroundColor: 'rgb(245, 245, 245, 0.33)'
            },
            containerCss: {
                backgroundColor: 'rgb(255, 255, 255)',
                borderColor: 'rgb(212, 212, 212)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderRadius: '1px',
                boxShadow: 'rgba(51, 51, 51, 0.15) 0px 2px 16px 0px',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column'
            },
            left(actualWidth, actualHeight) {
                return `calc(50vw - ${actualWidth / 2}px)`;
            },
            top(actualWidth, actualHeight) {
                return `calc(40vh - ${actualHeight / 2}px)`;
            },
            header: args?.header
        } as IDialogArgs;
        return this.openDialog(component, inputs, a);
    }
    // openConfirmationDialog(title: string, message: string, args?: IConfirmationDialogArgs): Promise<boolean> {
    //     const modalArgs = { ...args ?? {}, header: { title, allowCLose: true } } as IModalArgs;
    //     return new Promise((resolve) => {
    //         const dialogRef = this.openModal(ConfirmationDialogComponent, { message }, modalArgs);
    //         dialogRef.afterClosed$.subscribe((result) => {
    //             resolve(result);
    //         });
    //     });
    // }

    private openDialog<T>(component: Type<T>, inputs: { [key: string]: any } = {}, args: IDialogArgs = {}): DialogRef {
        const dialogRef = new DialogRef();
        // Create a backdrop element
        const backdrop = this.createBackdrop(dialogRef, args);
        // Append backdrop to the body
        document.body.appendChild(backdrop);

         // Create an injector that provides the DialogRef
         const injector = Injector.create({
            providers: [{ provide: TAB_DIALOG_REF, useValue: dialogRef }],
            parent: this.injector
        });

        // Create the component view
        const componentView = this.createView(component, inputs, injector);
        // Attach component to the application
        this.appRef.attachView(componentView);

        // Create a container for the dialog
        const dialogElement = this.createDialogElement(componentView, args, injector, dialogRef);
        // Before attaching the container to the document, trap focus
        // This means that we get all elements which are tabbable and set the tabindex to -1 for the duration of the popup
        const trappedFocus = this.trapFocus();
        document.body.appendChild(dialogElement);

        // Handle container position and window resize event
        const resizeSubscription = this.setDialogPosition(dialogElement, args);
      

        // Handle dialog close
        dialogRef.afterClosed$.subscribe(() => {
            if (resizeSubscription) {
                resizeSubscription.unsubscribe();
            }
            document.body.removeChild(dialogElement);
            document.body.removeChild(backdrop);
            this.appRef.detachView(componentView);
            this.restoreFocus(trappedFocus);
        });

        return dialogRef;
    }

    private createBackdrop(dialogRef: DialogRef, args: IDialogArgs): HTMLDivElement {
        const backdrop = document.createElement('div');
        backdrop.classList.add('dialog-backdrop');
        if (args.backdropCss) {
            Object.keys(args.backdropCss).forEach(key => {
                (backdrop.style as any)[key] = args.backdropCss![key];
            });
        }
        if (args.closeOnBackdropClick) {
            backdrop.addEventListener('click', () => dialogRef.close());
        }
        return backdrop;
    }

    private createView<T>(component: Type<T>, inputs: { [key: string]: any } = {}, injector: Injector): ViewRef {
       
        const componentRef: ComponentRef<T> = createComponent(component, {
            environmentInjector: this.environmentInjector,
            elementInjector: injector
        });
        // Set inputs on the component
        // They can be either static or function (signals)
        const instance = componentRef.instance as any;
        Object.keys(inputs).forEach(key => {
            if (typeof instance[key]?.set === 'function') {
                instance[key].set(inputs[key]);
            } else {
                instance[key] = inputs[key];
            }
        });
        return componentRef.hostView;
    }

    private createDialogElement(viewRef: ViewRef, args: IDialogArgs, injector: Injector, dialogRef: DialogRef): HTMLElement {
        const dialogElement = (viewRef as any).rootNodes[0] as HTMLElement;
        dialogElement.classList.add('dialog-container');
        if (args.width) dialogElement.style.width = args.width;
        if (args.height) dialogElement.style.height = args.height;
        if (args.maxWidth) dialogElement.style.maxWidth = args.maxWidth;
        if (args.maxHeight) dialogElement.style.maxHeight = args.maxHeight;
        if (args.containerCss) {
            Object.keys(args.containerCss).forEach(key => {
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
                const iconRef: ComponentRef<IconComponent> = createComponent(IconComponent, {
                    environmentInjector: this.environmentInjector,
                    elementInjector: injector
                });
                const iconElement = (iconRef.hostView as any).rootNodes[0] as HTMLElement;
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

    private setDialogPosition(dialogElement: HTMLElement, args: IDialogArgs): Subscription | null {
        const calculateAndSetPosition = () => {
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
        };

        if (typeof args.top === 'function' || typeof args.left === 'function') {
            // Temporarily position the dialog offscreen to get its dimensions
            dialogElement.style.top = '-9999px';
            dialogElement.style.left = '-9999px';

            setTimeout(() => {
                calculateAndSetPosition();
            });
        } else {
            calculateAndSetPosition();
        }

        let resizeSubscription: Subscription | null = null;
        if (typeof args.top === 'function' || typeof args.left === 'function') {
            resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
                calculateAndSetPosition();
            });
        }
        return resizeSubscription;
    }

    private trapFocus(): { element: FocusableElement, originalTabIndex: number }[] {
        const tabbableElements = tabbable(document.body);
        const elementsTable = tabbableElements.map(e => ({
            element: e,
            originalTabIndex: e.tabIndex
        }));
        elementsTable.forEach(e => e.element.tabIndex = -1);
        return elementsTable;
    }
    private restoreFocus(elements: { element: FocusableElement, originalTabIndex: number }[]) {
        elements.forEach(e => e.element.tabIndex = e.originalTabIndex);
    }
}
