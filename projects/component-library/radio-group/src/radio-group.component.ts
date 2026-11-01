import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, contentChild, contentChildren, effect, ElementRef, forwardRef, inject, input, linkedSignal, output, signal } from '@angular/core';

import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { IOptionGridContext } from 'tableau-ui-angular/common';
import { ErrorComponent, OptionComponent } from 'tableau-ui-angular/common';
import type { Primitive } from 'tableau-ui-angular/types';
import { generateRandomString } from 'tableau-ui-angular/utils';

@Component({
  selector: 'tab-radio-group',
  standalone: false,
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // WAI-ARIA's radio group: the host groups the native radios, which keep their keys. The app names it with aria-label
  // or aria-labelledby on tab-radio-group, or a form field's label does
  host: {
    role: 'radiogroup',
  },
})
export class RadioGroupComponent<T extends Primitive> implements ControlValueAccessor {
  readonly $disabled = signal(false);
  /** The selected value */
  readonly $valueInput: InputSignal<T | undefined> = input<T | undefined>(undefined, {
    alias: 'value',
  });
  /** The selected value: the value input, until a form writes or the user picks */
  readonly $value: WritableSignal<T | undefined> = linkedSignal(this.$valueInput);
  /** Emits the value on each pick by the user; a form's write emits nothing */
  readonly valueChange = output<T | undefined>();
  readonly name = this.generateRandomGroupName();
  readonly $options = contentChildren<OptionComponent<T>>(OptionComponent<T>);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $selectedOption: Signal<OptionComponent<T> | undefined> = computed(() => {
    const selected = this.$value();
    return this.$options().find(option => sameValue(option.$value(), selected));
  });
  protected readonly errorId = `${generateRandomString(16)}-error`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  // Whether the group set its host's aria-invalid, so it takes off only its own
  private invalidMarked = false;
  // The error describes the group and marks it invalid while it shows; the app's own ids, and a form field's, stay.
  // It runs on the server too, so the first HTML has them
  private readonly describeGroup = effect(() => {
    const host = this.host.nativeElement;
    const error = this.$errorElement() !== undefined;
    setOwnIds(host, 'aria-describedby', [this.errorId], error ? [this.errorId] : []);
    if (error && !this.invalidMarked && host.getAttribute('aria-invalid') !== 'true') {
      host.setAttribute('aria-invalid', 'true');
      this.invalidMarked = true;
    } else if (!error && this.invalidMarked) {
      host.removeAttribute('aria-invalid');
      this.invalidMarked = false;
    }
  });

  // eslint-disable-next-line  @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onChange = (value: T | undefined) => {};
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  onTouched = () => {};

  writeValue(value: T | undefined): void {
    this.$value.set(value);
  }

  registerOnChange(fn: (value: T | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.$disabled.set(isDisabled);
  }

  selectValue(option: OptionComponent<T>) {
    if (!this.$disabled() && !option.$disabled() && this.$selectedOption() !== option) {
      const value = option.$value();
      this.$value.set(value);
      this.valueChange.emit(value);
      this.onChange(value);
    }
  }

  onKeyDown(e: KeyboardEvent, option: OptionComponent<T>) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.selectValue(option);
      e.preventDefault();
    }
  }

  generateRandomGroupName(length: number = 8): string {
    return `group-${generateRandomString(length)}`;
  }

  optionTemplateContext: IOptionGridContext = {
    renderIcon: true,
    renderText: true,
    renderHint: true,
  };
}

/**
 * Writes `ids` last in an id list attribute such as `aria-describedby`, in place of the ids in `own`: the app's ids
 * stay, and the library's own come and go
 */
function setOwnIds(element: Element, attribute: string, own: readonly string[], ids: readonly string[]) {
  const current = element.getAttribute(attribute);
  const kept = (current ?? '').split(/\s+/).filter(id => id !== '' && !own.includes(id));
  const value = [...kept, ...ids].join(' ');
  if (value === '') {
    element.removeAttribute(attribute);
  } else if (value !== current) {
    element.setAttribute(attribute, value);
  }
}

/** Whether two option values are the same: equal dates are, though they are different objects */
function sameValue(a: Primitive | undefined, b: Primitive | undefined): boolean {
  return a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b;
}
