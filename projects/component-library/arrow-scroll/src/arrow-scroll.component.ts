import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, effect, HostListener, input, signal, viewChild } from '@angular/core';
import { ButtonComponent } from 'tableau-ui-angular/button';
import { SeparatorComponent } from 'tableau-ui-angular/common';

@Component({
    selector: 'tab-arrow-scroll',
    imports: [ButtonComponent, SeparatorComponent],
    standalone: true,
    templateUrl: './arrow-scroll.component.html',
    styleUrl: './arrow-scroll.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.overflow]': '"hidden"',
        '[class.horizontal]': '$scrollDirection() === "horizontal"',
        '[class.vertical]': '$scrollDirection() === "vertical"',
    },
})
export class ArrowScrollComponent implements AfterViewInit, OnDestroy {
    /**
     * The type of scroll behavior to use.
     * 'default' uses the default scroll behavior,
     * 'arrow' uses arrow buttons for scrolling.
     */
    readonly $scrollType = input.required<'arrow' | 'default'>({
        alias: 'scrollType',
    });
    /**
     * The direction of the scroll.
     * 'horizontal' scrolls horizontally,
     * 'vertical' scrolls vertically.
     */
    readonly $scrollDirection = input.required<'horizontal' | 'vertical'>({
        alias: 'scrollDirection',
    });

    /**
     * Gap between the scroll buttons the scroll container, can be adjusted to fit design requirements.
     * @default '0.25rem'
     */
    readonly $buttonsGap = input<string>('0.25rem', {
        alias: 'buttonsGap',
    });
    /**
     * Color of the scroll buttons, can be adjusted to fit design requirements.
     * @default 'plain'
     */
    readonly $buttonsColor = input<'error' | 'plain' | 'primary' | 'secondary'>('plain', {
        alias: 'buttonsColor',
    });
    /**
     * CSS color for the scroll button icons, can be adjusted to fit design requirements.
     * @default undefined
     */
    readonly $buttonsCssColor = input<string | undefined>(undefined, {
        alias: 'buttonsCssColor',
    });
    /**
     * The amount to scroll when the scroll buttons are clicked.
     * This value is in pixels for vertical scrolling and in pixels for horizontal scrolling.
     * @default 100
     */
    readonly $buttonScrollAmount = input<number>(100, {
        alias: 'buttonScrollAmount',
    });
    /**
     * Whether to show a separator between the scroll buttons and the scroll container.
     * @default false
     */
    readonly $showScrollButtonSeparator = input<boolean>(false, {
        alias: 'showScrollButtonSeparator',
    });
    private readonly $scrollContainer = viewChild.required<ElementRef<HTMLDivElement>>('scrollContainer');

    private readonly $scrollContainerDimensions = signal<{
        scrollHeight: number;
        clientHeight: number;
        scrollWidth: number;
        clientWidth: number;
    }>({
        scrollHeight: 0,
        clientHeight: 0,
        scrollWidth: 0,
        clientWidth: 0,
    });

    protected readonly $scrollArrowsVisible = computed(() => {
        if (this.$scrollType() === 'default') {
            return false;
        }

        const dimensions = this.$scrollContainerDimensions();
        if (this.$scrollDirection() === 'horizontal') {
            return dimensions.scrollWidth > dimensions.clientWidth;
        } else {
            return dimensions.scrollHeight > dimensions.clientHeight;
        }
    });
    private readonly scrollDirectionChanged = effect(() => {
        const el = this.$scrollContainer().nativeElement;
        if (this.$scrollDirection() === 'horizontal') {
            this.overrideMouseWheelForHorizontal(el);
        } else {
            this.removeMouseWheelOverride(el);
        }
    });

    private readonly $scrollLeft = signal(0);
    private readonly $scrollTop = signal(0);

    readonly $canScroll = computed(() => {
        const el = this.$scrollContainer().nativeElement;
        const dir = this.$scrollDirection();
        const scrollLeft = this.$scrollLeft();
        const scrollTop = this.$scrollTop();
        if (dir === 'horizontal') {
            return {
                back: scrollLeft > 0,
                forward: scrollLeft + el.clientWidth < el.scrollWidth,
            };
        } else {
            return {
                back: scrollTop > 0,
                forward: scrollTop + el.clientHeight < el.scrollHeight,
            };
        }
    });

    private observer: ResizeObserver | null = null;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private scrollHandler: (event: Event) => void = () => {};
    ngAfterViewInit(): void {
        const el = this.$scrollContainer().nativeElement;
        this.recalculateScrollContainerDimensions(el);
        this.observer = new ResizeObserver(() => {
            this.recalculateScrollContainerDimensions(el);
        });
        this.observer.observe(this.$scrollContainer().nativeElement);

        this.scrollHandler = () => {
            this.$scrollLeft.set(el.scrollLeft);
            this.$scrollTop.set(el.scrollTop);
        };
        el.addEventListener('scroll', this.scrollHandler, {
            passive: false,
        });
    }
    ngOnDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        const el = this.$scrollContainer().nativeElement;
        this.removeMouseWheelOverride(el);
        el.removeEventListener('scroll', this.scrollHandler);
    }

    @HostListener('window:resize')
    onResize() {
        this.recalculateScrollContainerDimensions(this.$scrollContainer().nativeElement);
    }
    private recalculateScrollContainerDimensions(el: HTMLDivElement) {
        this.$scrollContainerDimensions.set({
            scrollHeight: el.scrollHeight,
            clientHeight: el.offsetHeight,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private wheelHandler: (event: WheelEvent) => void = () => {};
    private overrideMouseWheelForHorizontal(el: HTMLDivElement) {
        this.wheelHandler = (event: WheelEvent) => {
            if (event.deltaY !== 0) {
                event.preventDefault();
                el.scrollBy({
                    left: event.deltaY,
                    behavior: 'smooth',
                });
            }
        };

        el.addEventListener('wheel', this.wheelHandler, {
            passive: false,
        });
    }
    private removeMouseWheelOverride(el: HTMLDivElement) {
        el.removeEventListener('wheel', this.wheelHandler);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.wheelHandler = () => {};
    }

    scroll(direction: 'back' | 'forward') {
        const el = this.$scrollContainer();
        const amount = this.$buttonScrollAmount();
        if (this.$scrollDirection() === 'horizontal') {
            el.nativeElement.scrollBy({
                left: direction === 'forward' ? amount : amount * -1,
                behavior: 'smooth',
            });
        } else {
            el.nativeElement.scrollBy({
                top: direction === 'forward' ? amount : amount * -1,
                behavior: 'smooth',
            });
        }
    }
}
