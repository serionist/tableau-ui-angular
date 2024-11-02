import {
    Directive,
    Input,
    ElementRef,
    HostListener,
    TemplateRef,
    input,
    inject,
} from '@angular/core';

// Style contained in _tooltips.scss in the styles folder
@Directive({
    selector: '[tooltip]',
})
export class TooltipDirective {
    tooltip = input<TemplateRef<any> | string>();
    tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>('top');
    tooltipMargin = input<string>('5px');

    private tooltipElement: HTMLElement | null = null;

    private elementRef = inject(ElementRef);

    @HostListener('mouseenter') onMouseEnter() {
        if (this.tooltip()) {
            this.createTooltip();
        }
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.destroyTooltip();
    }

    private createTooltip() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = `tab-tooltip ${this.tooltipPosition()}`;
        if (typeof this.tooltip() === 'string') {
            this.tooltipElement.innerText = this.tooltip() as string;
        } else {
            const viewContainerRef = (
                this.tooltip() as TemplateRef<any>
            ).createEmbeddedView({}).rootNodes[0];
            this.tooltipElement.appendChild(viewContainerRef);
        }
        document.body.appendChild(this.tooltipElement);

        const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
        const tooltipPos = this.tooltipElement.getBoundingClientRect();

        let top: string, left: string;
        switch (this.tooltipPosition()) {
            case 'top':
                top = `max(0px, calc(${
                    hostPos.top - tooltipPos.height
                }px - ${this.tooltipMargin()}))`;
                left = `max(0px, ${
                    hostPos.left + (hostPos.width - tooltipPos.width) / 2
                }px)`;
                break;
            case 'bottom':
                top = `max(0px, calc(${
                    hostPos.bottom
                }px + ${this.tooltipMargin()}))`;
                left = `max(0px, ${
                    hostPos.left + (hostPos.width - tooltipPos.width) / 2
                }px)`;
                break;
            case 'left':
                top = `max(0px, ${
                    hostPos.top + (hostPos.height - tooltipPos.height) / 2
                }px)`;
                left = `max(0px, calc(${hostPos.left}px - ${
                    tooltipPos.width
                }px - ${this.tooltipMargin()}))`;
                break;
            case 'right':
                top = `max(0px, ${
                    hostPos.top + (hostPos.height - tooltipPos.height) / 2
                }px)`;
                left = `max(0px, calc(${
                    hostPos.right
                }px + ${this.tooltipMargin()})`;
                break;
        }

        // Ensure tooltip stays within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

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
