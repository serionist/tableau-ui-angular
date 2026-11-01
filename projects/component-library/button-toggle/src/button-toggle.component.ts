import type { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, contentChildren, HostListener, input, model, TemplateRef, viewChildren } from '@angular/core';
import type { IOptionLineContext } from 'tableau-ui-angular/common';
import { OptionComponent } from 'tableau-ui-angular/common';
import type { Primitive } from 'tableau-ui-angular/types';

@Component({
  selector: 'tab-button-toggle',
  standalone: false,
  templateUrl: './button-toggle.component.html',
  styleUrl: './button-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // The radio group pattern: the app names the group with aria-label or aria-labelledby on it, and its options take
    // the focus, one Tab stop among them
    role: 'radiogroup',
    '[class.disabled]': '$disabled()',
    '[attr.disabled]': '$disabled() ? true : null',
    '[attr.aria-disabled]': '$disabled() ? "true" : null',
  },
})
export class ButtonToggleComponent<T extends Primitive> {
  /**
   * Disables the button toggle component.
   * This will prevent any interaction with the component
   * @default false
   */
  readonly $disabled = input(false, {
    alias: 'disabled',
  });
  /**
   * The value of the button toggle component.
   * This is the value that will be emitted when an option is selected.
   * If no value is selected, it will be undefined.
   * @default undefined
   */
  readonly $selectedValue = model<T | undefined>(undefined, {
    alias: 'selectedValue',
  });

  protected readonly $options = contentChildren(OptionComponent<T>);
  protected readonly $optionElements = viewChildren<ElementRef<HTMLElement>>('optionElement');

  // The option shown as selected: the one whose value is bound, once it is there. The toggle writes the bound value
  // only on the user's pick, so a value set while it is disabled, on a disabled option or before the options come
  // stays the app's
  protected readonly $selectedOption = computed(() => {
    const value = this.$selectedValue();
    return this.$options().find(option => option.$value() === value);
  });

  // One Tab stop: the checked option, or the first enabled one while none is checked; none while the toggle is disabled
  protected readonly $tabStop = computed(() => {
    if (this.$disabled()) {
      return undefined;
    }
    return this.$selectedOption() ?? this.$options().find(option => !option.$disabled());
  });

  protected readonly $optionRenderContext = computed<IOptionLineContext>(() => {
    return {
      renderIcon: true,
      renderText: true,
      renderAsDisabled: this.$disabled(),
    };
  });

  // An option with only an icon is named by its string hint, which its tooltip shows as the name: a tooltip equal to
  // its element's name describes nothing, so it isn't read twice
  protected $hintName(option: OptionComponent<T>): string | null {
    const text = option.$text();
    const hint = option.$hint();
    const hasText = text !== undefined && (typeof text !== 'string' || text.trim() !== '');
    return !hasText && typeof hint === 'string' && hint.trim() !== '' ? hint : null;
  }

  // a hint is text or a template
  protected $isTemplate(hint: unknown): hint is TemplateRef<unknown> {
    return hint instanceof TemplateRef;
  }

  optionClicked(option: OptionComponent<T>): void {
    if (this.$disabled() || option.$disabled()) {
      return;
    }
    this.$selectedValue.set(option.$value());
  }

  // The radio group pattern: Right and Down check the next enabled option, Left and Up the previous one, wrapping, and
  // move the focus to it; Space checks the option that has focus. The keys come from the focused option
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // a click focuses an option of a disabled toggle, whose value the keys must not change either; with a modifier the
    // key is another shortcut, such as Alt+Left for the browser's Back
    if (this.$disabled() || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const options = this.$options();
    // the option the key came from, or the checked one for a key sent to the toggle itself
    const focused = this.$optionElements().findIndex(element => event.target instanceof Node && element.nativeElement.contains(event.target));
    const from = focused === -1 ? options.findIndex(option => option === this.$selectedOption()) : focused;
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = this.enabledOption(from, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = this.enabledOption(from === -1 ? options.length : from, -1);
        break;
      case ' ':
        next = from !== -1 && !options[from].$disabled() ? from : undefined;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next === undefined) {
      return;
    }
    if (options[next] !== this.$selectedOption()) {
      this.$selectedValue.set(options[next].$value());
    }
    if (focused !== -1) {
      this.$optionElements().at(next)?.nativeElement.focus();
    }
  }

  // The first enabled option after `start`, `step` at a time, wrapping past the ends
  private enabledOption(start: number, step: 1 | -1): number | undefined {
    const options = this.$options();
    for (let move = 1; move <= options.length; move++) {
      const index = (((start + step * move) % options.length) + options.length) % options.length;
      if (!options[index].$disabled()) {
        return index;
      }
    }
    return undefined;
  }
}
