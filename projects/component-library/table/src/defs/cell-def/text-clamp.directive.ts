import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Directive, ElementRef, inject, output } from '@angular/core';
import type { Subscription } from 'rxjs';
import { debounceTime, Subject } from 'rxjs';
@Directive({
    selector: '[textClamp]',
    standalone: false,
})
export class TextClampDirective implements AfterViewInit, OnDestroy {
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly isClampedUpdated = output<boolean>();
    private resizeObserver: ResizeObserver | null = null;
    private mutationObserver: MutationObserver | null = null;
    private commandSub: Subscription | null = null;
    private readonly updateTextClampCommand = new Subject<void>();
    ngAfterViewInit(): void {
        this.commandSub = this.updateTextClampCommand.pipe(debounceTime(100)).subscribe(() => {
            this.updateTextClamp();
        });
        this.resizeObserver = new ResizeObserver(() => {
            this.updateTextClampCommand.next();
        });
        this.resizeObserver.observe(this.element.nativeElement);

        this.mutationObserver = new MutationObserver(() => {
            this.updateTextClampCommand.next();
        });
        this.mutationObserver.observe(this.element.nativeElement, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        this.updateTextClampCommand.next();
    }

    private updateTextClamp(): void {
        const element = this.element.nativeElement;
        if (element.scrollHeight > element.clientHeight) {
            this.isClampedUpdated.emit(true);
        } else {
            this.isClampedUpdated.emit(false);
        }
    }

    ngOnDestroy(): void {
        if (this.commandSub) {
            this.commandSub.unsubscribe();
            this.commandSub = null;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
    }
}
