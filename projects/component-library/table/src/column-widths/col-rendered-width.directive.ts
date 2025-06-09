import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Directive, ElementRef, inject, input, Signal, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Directive({
    selector: '[colRenderedWidth]',
    standalone: true,
})
export class ColRenderedWidthDirective implements OnDestroy, AfterViewInit {
    readonly columnId = input.required<string>({
        alias: 'colRenderedWidth',
    });
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly _renderedWidth = new BehaviorSubject<number>(0);
    public get renderedWidth(): Observable<number> {
        return this._renderedWidth;
    }

    private observer: ResizeObserver | undefined;
    public get isObserving() {
        return this.observer !== undefined;
    }
    ngAfterViewInit(): void {
        this.observer = new ResizeObserver(() => {
            const width = +getComputedStyle(this.element.nativeElement).width.replace('px', '');
            this._renderedWidth.next(width);
        });
        this.observer.observe(this.element.nativeElement);
    }

    ngOnDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
        }
    }
}
