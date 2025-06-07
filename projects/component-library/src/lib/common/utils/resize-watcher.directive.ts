import { Directive, ElementRef, inject, OnDestroy, OnInit, output } from '@angular/core';

@Directive({
    selector: '[resizeWatcher]',
    standalone: false,
})
export class ResizeWatcherDirective implements OnDestroy {
    readonly element = inject(ElementRef);
    private readonly observer: ResizeObserver;

    readonly resized = output<{ currentElement: ElementRef; entries: ResizeObserverEntry[] }>();
    constructor() {
        if (this.element.nativeElement === undefined) {
            throw new Error('ResizeWatcherDirective: ElementRef is undefined');
        }
        this.observer = new ResizeObserver((entries) => {
            this.resized.emit({ currentElement: this.element, entries });
        });
        this.observer.observe(this.element.nativeElement);
    }
    ngOnDestroy(): void {
        this.observer?.disconnect();
    }
}
