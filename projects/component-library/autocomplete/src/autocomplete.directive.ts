import type { OnDestroy } from '@angular/core';
import { DestroyRef, Directive, effect, ElementRef, HostListener, inject, input } from '@angular/core';
import type { Subscription } from 'rxjs';
import type { DialogRef } from 'tableau-ui-angular/dialog';
import type { AutoCompleteComponent } from './autocomplete.component';
import type { Primitive } from 'tableau-ui-angular/types';
@Directive({
  selector: 'input[tabAutoComplete]',
  standalone: false,
  // A combobox with list autocomplete (WAI-ARIA's pattern); the suggestions set its state while they are open for it
  host: {
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
  },
})
export class AutoCompleteDirective<T extends Primitive> implements OnDestroy {
  private readonly ref = inject<ElementRef<HTMLInputElement>>(ElementRef);
  readonly $tabAutoComplete = input.required<AutoCompleteComponent<T>>({
    alias: 'tabAutoComplete',
  });
  // The suggestions while they are open for this input: an autocomplete several inputs share is open for one at a time
  private open: DialogRef | undefined = undefined;
  private autoCompleteSelectedSub: Subscription | undefined = undefined;
  private readonly autocompleteChanged = effect(() => {
    const autoComplete = this.$tabAutoComplete();
    if (this.autoCompleteSelectedSub) {
      this.autoCompleteSelectedSub.unsubscribe();
    }
    this.autoCompleteSelectedSub = autoComplete.selectValue$.subscribe(option => {
      if (!this.open) {
        return;
      }
      const el = this.ref.nativeElement;
      el.value = option.$value()?.toString() ?? '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      autoComplete.closeDropdown();
    });
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.autoCompleteSelectedSub?.unsubscribe());
  }

  private openDropdown() {
    const ref = this.$tabAutoComplete().openDropdown(this.ref.nativeElement);
    if (ref && ref !== this.open) {
      this.open = ref;
      ref.closed$.subscribe(() => {
        if (this.open === ref) {
          this.open = undefined;
        }
      });
    }
  }

  @HostListener('focusin')
  onFocusIn() {
    this.openDropdown();
  }

  @HostListener('focusout')
  onFocusOut() {
    this.open?.close();
  }

  @HostListener('input')
  onInput() {
    this.openDropdown();
  }

  @HostListener('click')
  onClick() {
    this.openDropdown();
  }

  ngOnDestroy(): void {
    this.open?.close();
  }
}
