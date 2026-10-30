import type { OnDestroy } from '@angular/core';
import { afterNextRender, Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[resizeWatcher]',
  standalone: false,
})
export class ResizeWatcherDirective implements OnDestroy {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: ResizeObserver | undefined;

  readonly resized = output<{ currentElement: ElementRef; entries: ResizeObserverEntry[] }>();
  constructor() {
    if (this.element.nativeElement === undefined) {
      throw new Error('ResizeWatcherDirective: ElementRef is undefined');
    }
    // The server has no ResizeObserver, so it observes after the first render, in the browser only
    afterNextRender(() => {
      this.observer = new ResizeObserver(entries => {
        this.resized.emit({ currentElement: this.element, entries });
      });
      this.observer.observe(this.element.nativeElement);
    });
  }
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
