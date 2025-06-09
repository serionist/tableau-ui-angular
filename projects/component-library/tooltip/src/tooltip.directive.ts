import type { TemplateRef, OnDestroy, InputSignal } from '@angular/core';
import { Directive, Input, ElementRef, HostListener, input, inject, ViewContainerRef, effect } from '@angular/core';

// Style contained in _tooltips.scss in the styles folder
@Directive({
    selector: '[tooltip]',
    standalone: true,
})
export class TooltipDirective<T> implements OnDestroy {
    private readonly viewContainerRef = inject(ViewContainerRef);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $tooltip: InputSignal<TemplateRef<T | undefined> | string | null | undefined> = input.required<TemplateRef<T | undefined> | string | null | undefined>({
        alias: 'tooltip',
    });
    readonly $tooltipContext = input<T>(undefined, {
        alias: 'tooltipContext',
    });
    readonly $tooltipPosition = input<'bottom' | 'left' | 'right' | 'top'>('top', {
        alias: 'tooltipPosition',
    });
    readonly $tooltipMargin = input<string>('5px', {
        alias: 'tooltipMargin',
    });

    private readonly tooltipChanged = effect(() => {
        const tooltip = this.$tooltip();
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
