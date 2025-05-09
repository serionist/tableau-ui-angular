import {
    Directive,
    effect,
    ElementRef,
    Host,
    HostListener,
    inject,
    input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { AutoCompleteComponent } from './autocomplete.component';
import { Subscription } from 'rxjs';
@Directive({
    selector: 'input[tabAutoComplete]',
    standalone: false,
})
export class AutoCompleteDirective implements OnDestroy {
    private readonly ref = inject<ElementRef<HTMLInputElement>>(ElementRef);
    readonly tabAutoComplete = input.required<AutoCompleteComponent>();
    private autoCompleteSelectedSub: Subscription | undefined = undefined;
    private readonly autocompleteChanged = effect(() => {
        const autoComplete = this.tabAutoComplete();
        if (this.autoCompleteSelectedSub) {
            this.autoCompleteSelectedSub.unsubscribe();
        }
        this.autoCompleteSelectedSub = autoComplete.selectValue$.subscribe(
            (option) => {
                const el = this.ref.nativeElement;
                if (!el) {
                    return;
                }
                el.value = option.value();
                el.dispatchEvent(
                    new Event('input', { bubbles: true })
                );
                autoComplete.closeDropdown();
            }
        );
    });

    @HostListener('focusin')
    onFocusIn() {
        this.tabAutoComplete().openDropdown(this.ref.nativeElement);
    }

    @HostListener('focusout')
    onFocusOut() {
        this.tabAutoComplete().closeDropdown();
    }

    @HostListener('input', ['$event'])
    onInput(event: Event) {
        this.tabAutoComplete().openDropdown(this.ref.nativeElement);
    }

    @HostListener('click')
    onClick() {
        this.tabAutoComplete().openDropdown(this.ref.nativeElement);
    }

    ngOnDestroy(): void {
        this.tabAutoComplete().closeDropdown();
    }
}
