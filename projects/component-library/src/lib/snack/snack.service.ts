import {
    ApplicationRef,
    ComponentRef,
    createComponent,
    EnvironmentInjector,
    Injectable,
    Injector,
    TemplateRef,
    Type,
    ViewRef,
} from '@angular/core';
import { SnackRef, TAB_SNACK_REF } from './snack.ref';
import { SnackComponent } from './snack.component';
import { TableauUiSnackModule } from './tableau-ui-snack.module';

// Styles for the snack container are in _snack.service.scss in the styles folder
@Injectable({
    providedIn: TableauUiSnackModule
})
export class SnackService {
    constructor(
        private injector: Injector,
        private appRef: ApplicationRef,
        private environmentInjector: EnvironmentInjector
    ) {}
    openSnack(
        message: string,
        duration: number | undefined = 5000,
        type: 'info' | 'error' = 'info',
        location: 'top' | 'bottom' = 'top'
    ): SnackRef {
        return this.openSnackComponent(
            SnackComponent,
            { type, message },
            duration,
            type,
            location
        );
    }
    openSnackFromTemplate(
        template: TemplateRef<any>,
        duration: number | undefined = 5000,
        type: 'info' | 'error' = 'info',
        location: 'top' | 'bottom' = 'top'
    ) {
        return this.openSnackComponent(
            SnackComponent,
            { type, template },
            duration,
            type,
            location
        );
    }

    openSnackComponent(
        component: Type<any>,
        inputs: { [key: string]: any } = {},
        duration: number | undefined = 5000,
        type: 'info' | 'error' = 'info',
        location: 'top' | 'bottom' = 'top'
    ): SnackRef {
        // check if snack container exists
        let container = document.querySelector(
            `.tab-snacks.${location} .snack-container`
        );
        if (!container) {
            const tabSnacks = document.createElement('div');
            tabSnacks.classList.add('tab-snacks', location);
            container = document.createElement('div');
            container.classList.add('snack-container');
            tabSnacks.appendChild(container);
            document.body.appendChild(tabSnacks);
        }

        // create the snack wrapper
        const snackWrapper = document.createElement('div');
        snackWrapper.classList.add('snack-wrapper', type);
       
       
        const snackRef = new SnackRef();
        // Create an injector that provides the SnackRef
        const injector = Injector.create({
            providers: [{ provide: TAB_SNACK_REF, useValue: snackRef }],
            parent: this.injector,
        });

        // Create the component view
        const componentView = this.createView(component, inputs, injector);
        // Attach component to the application
        this.appRef.attachView(componentView);

        const componentElement = (componentView as any)
            .rootNodes[0] as HTMLElement;
        snackWrapper.appendChild(componentElement);
        // add timer if needed
        let timer: HTMLElement | undefined;
        if (duration > 0) {
            timer = document.createElement('div');
            timer.classList.add('timer');
            timer.style.transitionDuration = `${duration}ms`;
            snackWrapper.appendChild(timer);
        }
        if (location === 'top') {
            container.appendChild(snackWrapper);
        } else {
            container.insertBefore(snackWrapper, container.firstChild);
        }

        const getMargin = () => {
            let height = snackWrapper.offsetHeight + 3;
            if (location === 'top') {
                return `-${height}px 0 3px 0`;
            } else {
                return `3px 0 -${height}px 0`;
            }
        }
        snackWrapper.style.margin = getMargin();
       
        setTimeout(() => {
            if (timer) {
                timer.style.width = '0';
            }
            snackWrapper.style.transition = 'margin 200ms ease-in-out, opacity 200ms ease-in-out';
            if (location === 'top') {
                snackWrapper.style.marginTop= '0';
            } else {
                snackWrapper.style.marginBottom= '0';
            }
            snackWrapper.style.opacity = '1';
        }, 1);

        // Remove snack after duration
        if (duration > 0) {
            setTimeout(() => {
                snackRef.close(undefined);
            }, duration);
        }

        snackRef.afterClosed$.subscribe(() => {
            snackWrapper.style.margin = getMargin();
            snackWrapper.style.opacity = '0';
            setTimeout(() => {
                snackWrapper.remove();
                this.appRef.detachView(componentView);
            }, 200);
        });

        return snackRef;
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
}
