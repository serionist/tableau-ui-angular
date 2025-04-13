import {
    Directive,
    Input,
    ElementRef,
    HostListener,
    TemplateRef,
    input,
    inject,
    OnDestroy,
    ViewContainerRef,
} from '@angular/core';

// Style contained in _tooltips.scss in the styles folder
@Directive({
    selector: '[tooltip]',
    standalone: false
})
export class TooltipDirective implements OnDestroy {
    private viewContainerRef = inject(ViewContainerRef);
    tooltip = input<TemplateRef<any> | string | undefined>();
    tooltipContext = input<any>();
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
    ngOnDestroy(): void {
        this.destroyTooltip();
    }

    private createTooltip() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = `tab-tooltip ${this.tooltipPosition()}`;
        if (typeof this.tooltip() === 'string') {
            this.tooltipElement.innerText = this.tooltip() as string;
        } else {
            const viewRef = (this.tooltip() as TemplateRef<any>)!.createEmbeddedView(this.tooltipContext() ?? {});
            this.viewContainerRef.insert(viewRef); // attach to view
            viewRef.detectChanges(); // trigger bindings
            viewRef.rootNodes.forEach(node => {
              this.tooltipElement!.appendChild(node);
            });
        }
        document.body.appendChild(this.tooltipElement);
    
        const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
        const tooltipPos = this.tooltipElement.getBoundingClientRect();
    
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
    
        let top: string, left: string;
        switch (this.tooltipPosition()) {
            case 'top':
                top = `calc(${hostPos.top + scrollY}px - ${tooltipPos.height}px - ${this.tooltipMargin() || 0})`;
                left = `calc(${hostPos.left + scrollX}px + ${(hostPos.width - tooltipPos.width) / 2}px)`;
                break;
            case 'bottom':
                top = `calc(${hostPos.bottom + scrollY}px + ${this.tooltipMargin() || 0})`;
                left = `calc(${hostPos.left + scrollX}px + ${(hostPos.width - tooltipPos.width) / 2}px)`;
                break;
            case 'left':
                top = `calc(${hostPos.top + scrollY}px + ${(hostPos.height - tooltipPos.height) / 2}px)`;
                left = `calc(${hostPos.left + scrollX}px - ${tooltipPos.width}px - ${this.tooltipMargin() || 0})`;
                break;
            case 'right':
                top = `calc(${hostPos.top + scrollY}px + ${(hostPos.height - tooltipPos.height) / 2}px)`;
                left = `calc(${hostPos.right + scrollX}px + ${this.tooltipMargin() || 0})`;
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
