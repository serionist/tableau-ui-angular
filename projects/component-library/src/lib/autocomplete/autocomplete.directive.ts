import { Directive, ElementRef, Host, HostListener, inject, input, OnDestroy, OnInit } from "@angular/core";
import { AutoCompleteComponent } from "./autocomplete.component";

@Directive({
    selector: 'input[tabAutoComplete]',
    standalone: false
})
export class AutoCompleteDirective implements OnDestroy{
    
    ref = inject<ElementRef<HTMLInputElement>>(ElementRef);
    tabAutoComplete = input.required<AutoCompleteComponent>();


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