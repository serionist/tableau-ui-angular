import type { TemplateRef, OnDestroy, ModelSignal } from '@angular/core';
import { Directive, ElementRef, HostListener, input, inject, effect, model, computed } from '@angular/core';
import type { DialogRef} from 'tableau-ui-angular/dialog';
import { DialogService, GlobalStackOptions } from 'tableau-ui-angular/dialog';
import type { TooltipComponentArgs } from './tooltip.component';
import { TooltipComponent } from './tooltip.component';

// Style contained in _tooltips.scss in the styles folder
@Directive({
    selector: '[tooltip]',
    standalone: false,
})
export class TooltipDirective<T> implements OnDestroy {
    private readonly dialogService = inject(DialogService);

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
     * Padding inside the tooltip.
     * This is used to add space inside the tooltip around the content.
     * It can be a string representing a CSS value (e.g., '0.5rem', '1rem').
     * It can also be any set of padding values like '0.5rem 1rem' for top/bottom and left/right padding.
     * @default '0.5rem'
     */
    readonly $tooltipPadding = model<string>('0.5rem', {
        alias: 'tooltipPadding',
    });

    /**
     * Mode for the tooltip arguments.
     * If 'full', the tooltip will use the full arguments provided in `$tooltipFullArgs`.
     * If 'individual', the tooltip will use the individual properties provided in `$tooltip`, `$
     * tooltipContext`, `$tooltipPosition`, and `$tooltipMargin`.
     * @default 'individual'
     */
    readonly $tooltipArgsMode = input<'full' | 'individual'>('individual', {
        alias: 'tooltipArgsMode',
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
        const mode = this.$tooltipArgsMode();
        const args = this.$tooltipFullArgs();
        if (mode == 'individual') {
            return; // Individual mode, no need to update tooltip args
        }
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
        if (this.tooltipDialogRef) {
            this.destroyTooltip();
            this.openTooltip();
        }
    });


    private readonly $tooltipMarginWithUnit = computed(() => {
        const margin = this.$tooltipMargin();
        // if margin is just a number, add 'px' to it
        return /^\d+$/.test(margin) ? `${margin}px` : margin;
    });

    openTooltip() {
        if (this.$tooltip() != null) {
            this.createTooltip();
        }
    }
    private tooltipDialogRef: DialogRef | undefined = undefined;

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
        if (this.tooltipDialogRef) {
            return;
        }
        const calculateTop = (pos: 'bottom' | 'left' | 'right' | 'top', actualWidth: number, actualHeight: number, insertAfterElementRect: DOMRect, recalculateCounter = 0) => {
            switch (pos) {
                case 'left':
                case 'right': {
                    // find the mid point of the element
                    const elementMidPoint = insertAfterElementRect.top + insertAfterElementRect.height / 2;
                    // calculate the top position based on the mid point and the height of the tooltip
                    const tooltipTop = elementMidPoint - actualHeight / 2;
                    return `max(${this.$tooltipMarginWithUnit()}, ${tooltipTop}px)`;
                }
                case 'top': {
                    // find the top of the element and subtract the height of the tooltip
                    const tooltipTop = insertAfterElementRect.top - actualHeight;
                    // if we hit the top of the screen, make the tooltip appear below the element
                    if (tooltipTop < 0 && recalculateCounter < 2) {
                        return calculateTop('bottom', actualWidth, actualHeight, insertAfterElementRect, recalculateCounter + 1);
                    }
                    // subtract the margin from the top position
                    // ensure the tooltip does not go above the top of the screen
                    return `max(0px, calc(${tooltipTop}px - ${this.$tooltipMarginWithUnit()}))`;
                }
                case 'bottom': {
                    // find the bottom of the element and add the height of the tooltip
                    const tooltipTop = insertAfterElementRect.bottom;
                    // if we hit the bottom of the screen, make the tooltip appear above the element
                    if (tooltipTop + actualHeight > window.innerHeight && recalculateCounter < 2) {
                        return calculateTop('top', actualWidth, actualHeight, insertAfterElementRect, recalculateCounter + 1);
                    }
                    // add the margin to the top position
                    // ensure the tooltip does not go below the bottom of the screen
                    return `min(${window.innerHeight - actualHeight}px, calc(${tooltipTop}px + ${this.$tooltipMarginWithUnit()}))`;
                }
                default:
                    return '0'; // Fallback case, should not happen
            }
        };
        const calculateLeft = (pos: 'bottom' | 'left' | 'right' | 'top', actualWidth: number, actualHeight: number, insertAfterElementRect: DOMRect, recalculateCounter = 0) => {
            switch (pos) {
                case 'top':
                case 'bottom': {
                    // find the mid point of the element
                    const elementMidPoint = insertAfterElementRect.left + insertAfterElementRect.width / 2;
                    // calculate the left position based on the mid point and the width of the tooltip
                    const tooltipLeft = elementMidPoint - actualWidth / 2;
                    // what is the smallest left coordinate that is acceptable
                    return `min(${tooltipLeft}px, calc(${window.innerWidth - actualWidth}px - ${this.$tooltipMarginWithUnit()}))`;
                }
                case 'left': {
                  
                    // find the left of the element and subtract the width of the tooltip
                    const tooltipLeft = insertAfterElementRect.left - actualWidth;
                    // if we hit the left side of the screen, make the tooltip appear on the right side of the element
                    if (tooltipLeft < 0 && recalculateCounter < 2) {
                        return calculateLeft('right', actualWidth, actualHeight, insertAfterElementRect, recalculateCounter + 1);
                    }
                    // ensure the tooltip does not go off the left side of the screen
                    return `max(0px, calc(${tooltipLeft}px - ${this.$tooltipMarginWithUnit()}))`;
                }
                case 'right': {
                    // find the right of the element and add the width of the tooltip
                    const tooltipLeft = insertAfterElementRect.right;
                    // if we hit the right side of the screen, make the tooltip appear on the left side of the element
                    if (tooltipLeft + actualWidth > window.innerWidth && recalculateCounter < 2) {
                        return calculateLeft('left', actualWidth, actualHeight, insertAfterElementRect, recalculateCounter + 1);
                    }
                    // ensure the tooltip does not go off the right side of the screen
                    return `min(${window.innerWidth - actualWidth}px, calc(${tooltipLeft}px + ${this.$tooltipMarginWithUnit()}))`;
                }
                default:
                    return '0'; // Fallback case, should not happen
            }
        };

        this.tooltipDialogRef = this.dialogService.openDialog(
            TooltipComponent,
            {
                tooltip: this.$tooltip(),
                tooltipContext: this.$tooltipContext(),
                padding: this.$tooltipPadding(),
            } as TooltipComponentArgs<T>,
            {
                backdropCss: undefined,
                skipCreatingBackdrop: true,
                closeOnBackdropClick: false,
                closeOnEscape: false,
                trapFocus: false,
                containerCss: {
                    pointerEvents: 'none',
                    backgroundColor: 'var(--twc-color-base)',
                    border: '1px solid var(--twc-color-border-light)',
                    borderRadius: '1px',
                    boxShadow: 'var(--twc-dialog-box-shadow)',
                    boxSizing: 'border-box',
                    display: 'block',
                    fontSize: '1rem',
                    lineHeight: '1.2',
                    padding: this.$tooltipPadding(),
                    tabindex: '-1'
                },
                header: undefined,
                height: undefined,
                width: undefined,
                top: (actualWidth, actualHeight, insertAfterElementRect) => {
                    return calculateTop(this.$tooltipPosition(), actualWidth, actualHeight, insertAfterElementRect!, 0);
                },
                left: (actualWidth, actualHeight, insertAfterElementRect) => {
                    return calculateLeft(this.$tooltipPosition(), actualWidth, actualHeight, insertAfterElementRect!, 0);
                },
            },
            new GlobalStackOptions(this.elementRef.nativeElement),
        );
       
    }

    private destroyTooltip() {
        if (this.tooltipDialogRef) {
            this.tooltipDialogRef.close();
            this.tooltipDialogRef = undefined;
        }
    }
}
export interface TooltipArgs<T> {
    template: TemplateRef<T | undefined> | string | null | undefined;
    context: T | undefined;
    position: 'bottom' | 'left' | 'right' | 'top';
    margin: string;
}
