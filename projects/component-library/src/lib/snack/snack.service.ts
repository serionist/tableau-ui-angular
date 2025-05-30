import {
    ApplicationRef,
    ComponentRef,
    createComponent,
    EnvironmentInjector,
    inject,
    Injectable,
    Injector,
    TemplateRef,
    Type,
    ViewRef,
} from '@angular/core';
import { SnackRef, TAB_SNACK_REF } from './snack.ref';
import { SnackComponent } from './snack.component';
import { TableauUiSnackModule } from './tableau-ui-snack.module';
import { TAB_SNACK_DATA_REF } from './data.ref';

// Styles for the snack container are in _snack.service.scss in the styles folder
@Injectable({
    providedIn: TableauUiSnackModule
})
export class SnackService {
    private injector = inject(Injector);
    private appRef = inject(ApplicationRef);
    private environmentInjector = inject(EnvironmentInjector);

    
    openSnack(
        message: string,
        duration: number | undefined = 5000,
        type: 'info' | 'error' | 'success' = 'info',
        location: 'top' | 'bottom' = 'top'
    ): SnackRef {
        return this.openSnackComponent(
            SnackComponent,
            {
                type,
                message,
                contentTemplate: undefined,
                contentTemplateContext: undefined
            },
            duration,
            type,
            location
        );
    }

    openSnackWithAction(
        message: string,
        actionLabel: string,
        action: (s: SnackRef) => void,
        duration: number | undefined = 5000,
        type: 'info' | 'error'  | 'success'= 'info',
        location: 'top' | 'bottom' = 'top'
    ) {
        return this.openSnackComponent(
            SnackComponent,
            {
                type,
                message,
                actionLink: actionLabel,
                action: action,
                contentTemplate: undefined,
                contentTemplateContext: undefined
            },
            duration,
            type,
            location
        );
    }
    openSnackFromTemplate<T = any>(
        template: TemplateRef<T>,
        templateContext?: T,
        duration: number | undefined = 5000,
        type: 'info' | 'error' | 'success' = 'info',
        location: 'top' | 'bottom' = 'top'
    ) {
        return this.openSnackComponent(
            SnackComponent,
            {
                type,
                message: undefined,
                contentTemplate: template,
                contentTemplateContext: templateContext || {}
            },
            duration,
            type,
            location
        );
    }

    openSnackComponent<TData, TComponent = any>(
        component: Type<TComponent>,
        data: TData,
        duration: number | undefined = 5000,
        type: 'info' | 'error' | 'success' = 'info',
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
            providers: [{ provide: TAB_SNACK_REF, useValue: snackRef },
                { provide: TAB_SNACK_DATA_REF, useValue: data }
            ],
            parent: this.injector,
        });

        // Create the component view
        const componentView = this.createView(component, injector);
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
            const height = snackWrapper.offsetHeight + 3;
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

    private createView<TComponent>(
        component: Type<TComponent>,
        injector: Injector
    ): ViewRef {
        const componentRef: ComponentRef<TComponent> = createComponent(
            component,
            {
                environmentInjector: this.environmentInjector,
                elementInjector: injector,
            }
        );
        return componentRef.hostView;
    }
}
