import type { OnDestroy } from '@angular/core';
import { afterNextRender, Directive, ElementRef, inject, input } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Directive({
  selector: '[colRenderedWidth]',
  standalone: false,
})
export class ColRenderedWidthDirective implements OnDestroy {
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

  constructor() {
    // after the first render, in the browser only: the server has no ResizeObserver, nor a layout to measure
    afterNextRender(() => {
      this.observer = new ResizeObserver(() => {
        const width = +getComputedStyle(this.element.nativeElement).width.replace('px', '');
        this._renderedWidth.next(width);
      });
      this.observer.observe(this.element.nativeElement);
    });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}
