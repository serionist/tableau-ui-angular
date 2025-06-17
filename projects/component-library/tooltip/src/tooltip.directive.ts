import type { TemplateRef, OnDestroy, ModelSignal } from '@angular/core';
import { Directive, ElementRef, HostListener, input, inject, ViewContainerRef, effect, model } from '@angular/core';

// Style contained in _tooltips.scss in the styles folder
@Directive({
    selector: '[tooltip]',
    standalone: false,
})
export class TooltipDirective<T> implements OnDestroy {
    private readonly viewContainerRef = inject(ViewContainerRef);
    
    /**
     * Tooltip directive to show a tooltip on hover.
     * The tooltip can be a string or a TemplateRef.
     * The tooltip will be positioned relative to the element it is applied to.
     * The tooltip will be destroyed when the element is destroyed.
     * The tooltip will be opened on mouse enter and closed on mouse leave.
     * @default undefined
     */
    readonly $tooltip: ModelSignal<TemplateRef<T | undefined> | string | null | undefined> = model.required<TemplateRef<T | undefined> | string | null | undefined>({
        alias: 'tooltip',
    });
    /**
     * Context for the tooltip template.
     * This is used to pass data to the tooltip template.
     * If the tooltip is a string, this will be ignored.
     * If the tooltip is a TemplateRef, this will be used as the context for the template.
     * @default undefined
     */
    readonly $tooltipContext = model<T | undefined>(undefined, {
        alias: 'tooltipContext',
    });
    /**
     * Position of the tooltip relative to the element.
     * Can be 'top', 'bottom', 'left', or 'right'.
     * @default 'top'
     */
    readonly $tooltipPosition = model<'bottom' | 'left' | 'right' | 'top'>('top', {
        alias: 'tooltipPosition',
    });
    /**
     * Margin around the tooltip.
     * This is used to position the tooltip away from the element.
     * It can be a string representing a CSS value (e.g., '5px', '1rem', '10%').
     * @default '5px'
     */
    readonly $tooltipMargin = model<string>('5px', {
        alias: 'tooltipMargin',
    });

    /**
     * Full arguments for the tooltip.
     * This is used to pass all the arguments to the tooltip.
     * If this is provided, it will override the individual tooltip properties.
     * This is used to set only. 
     */
    readonly $tooltipFullArgs = input<TooltipArgs<T> | undefined>(undefined, {
        alias: 'tooltipFullArgs',
    });

    private readonly tooltipFullArgsChanged = effect(() => {
        const args = this.$tooltipFullArgs();
        this.$tooltip.set(args?.template);
        this.$tooltipContext.set(args?.context);
        this.$tooltipPosition.set(args?.position ?? 'top');
        this.$tooltipMargin.set(args?.margin ?? '5px');
    });

    private readonly tooltipChanged = effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tooltip = this.$tooltip();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tooltipContext = this.$tooltipContext();
        if (this.tooltipElement) {
            this.destroyTooltip();
            this.openTooltip();
        }
    });

    openTooltip() {
        if (this.$tooltip() != null) {
            this.createTooltip();
        }
    }
    private tooltipElement: HTMLElement | null = null;

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @HostListener('mouseenter', ['$event']) onMouseEnter(e: MouseEvent) {
        if (e.buttons !== 0) {
            return;
        }
        this.openTooltip();
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.destroyTooltip();
    }
    ngOnDestroy(): void {
        this.destroyTooltip();
    }

    private createTooltip() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = `tab-tooltip ${this.$tooltipPosition()}`;
        if (typeof this.$tooltip() === 'string') {
            this.tooltipElement.innerText = this.$tooltip() as string;
        } else {
            const viewRef = (this.$tooltip() as TemplateRef<T | undefined>).createEmbeddedView(this.$tooltipContext());
            this.viewContainerRef.insert(viewRef); // attach to view
            viewRef.detectChanges(); // trigger bindings
            viewRef.rootNodes.forEach((node) => {
                this.tooltipElement!.appendChild(node);
            });
        }
        document.body.appendChild(this.tooltipElement);

        const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
        const tooltipPos = this.tooltipElement.getBoundingClientRect();

        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        let top: string, left: string;
        switch (this.$tooltipPosition()) {
            case 'top':
                top = `calc(${hostPos.top + scrollY}px - ${tooltipPos.height}px - ${this.$tooltipMargin() || 0})`;
                left = `calc(${hostPos.left + scrollX}px + ${(hostPos.width - tooltipPos.width) / 2}px)`;
                break;
            case 'bottom':
                top = `calc(${hostPos.bottom + scrollY}px + ${this.$tooltipMargin() || 0})`;
                left = `calc(${hostPos.left + scrollX}px + ${(hostPos.width - tooltipPos.width) / 2}px)`;
                break;
            case 'left':
                top = `calc(${hostPos.top + scrollY}px + ${(hostPos.height - tooltipPos.height) / 2}px)`;
                left = `calc(${hostPos.left + scrollX}px - ${tooltipPos.width}px - ${this.$tooltipMargin() || 0})`;
                break;
            case 'right':
                top = `calc(${hostPos.top + scrollY}px + ${(hostPos.height - tooltipPos.height) / 2}px)`;
                left = `calc(${hostPos.right + scrollX}px + ${this.$tooltipMargin() || 0})`;
                break;
        }
        // Apply calculated positions
        this.tooltipElement.style.top = top;
        this.tooltipElement.style.left = left;
    }

    private destroyTooltip() {
        if (this.tooltipElement) {
            document.body.removeChild(this.tooltipElement);
            this.tooltipElement = null;
        }
    }
}
export interface TooltipArgs<T> {
    template: TemplateRef<T | undefined> | string | null | undefined;
    context: T | undefined;
    position: 'bottom' | 'left' | 'right' | 'top';
    margin: string;
}