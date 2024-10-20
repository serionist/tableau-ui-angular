import { Directive, Input, ElementRef, HostListener } from "@angular/core";
import { TooltipComponent } from "./tooltip.component";

@Directive({
    selector: '[tooltip]',
    standalone: true
})
export class TooltipDirective {
    @Input('tooltip') tooltip!: TooltipComponent;
    @Input('tooltip-position') position: 'top' | 'bottom' | 'left' | 'right' = 'top';
    @Input('tooltip-margin') margin = 5;
    private tooltipElement: HTMLElement | null = null;

    constructor(private elementRef: ElementRef) {}

    @HostListener('mouseenter') onMouseEnter() {
        if (this.tooltip) {
            this.createTooltip();
        }
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.destroyTooltip();
    }

    private createTooltip() {
        const viewContainerRef = this.tooltip.tooltipTemplate.createEmbeddedView({}).rootNodes[0];
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = `tooltip tooltip-${this.position}`;
        this.tooltipElement.appendChild(viewContainerRef);
        document.body.appendChild(this.tooltipElement);

        const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
        const tooltipPos = this.tooltipElement.getBoundingClientRect();

        let top, left;
        switch (this.position) {
            case 'top':
                top = hostPos.top - tooltipPos.height - this.margin;
                left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
                break;
            case 'bottom':
                top = hostPos.bottom + this.margin;
                left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
                break;
            case 'left':
                top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
                left = hostPos.left - tooltipPos.width - this.margin;
                break;
            case 'right':
                top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
                left = hostPos.right + this.margin;
                break;
        }

        // Ensure tooltip stays within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (top < 0) {
            top = 0;
        } else if (top + tooltipPos.height > viewportHeight) {
            top = viewportHeight - tooltipPos.height;
        }

        if (left < 0) {
            left = 0;
        } else if (left + tooltipPos.width > viewportWidth) {
            left = viewportWidth - tooltipPos.width;
        }

        this.tooltipElement.style.top = `${top}px`;
        this.tooltipElement.style.left = `${left}px`;
    }

    private destroyTooltip() {
        if (this.tooltipElement) {
            document.body.removeChild(this.tooltipElement);
            this.tooltipElement = null;
        }
    }
}