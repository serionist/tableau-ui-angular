import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, forwardRef, input, linkedSignal, model, output } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ErrorComponent, HintComponent } from 'tableau-ui-angular/common';
import { generateRandomString } from 'tableau-ui-angular/utils';
@Component({
  selector: 'tab-checkbox',
  standalone: false,
  templateUrl: './checkbox.component.html',
  styleUrl: 'checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'checkbox',
    '[class.disabled]': '$disabled()',
    '[class.checked]': '$value() === true',
    '[class.partial]': '$value() === "partial"',
    '[class.loading]': '$loading()',
  },
})
export class CheckboxComponent implements ControlValueAccessor {
  /**
   * The disabled state of the checkbox.
   * For forms, disable the form field instead of using this property.
   */
  readonly $disabled = model(false, {
    alias: 'disabled',
  });
  /**
   * The value of the checkbox.
   * - `true`: Checkbox is checked
   * - `false`: Checkbox is unchecked
   * - `'partial'`: Checkbox is in a partial state (e.g., indeterminate)
   */
  readonly $valueInput: InputSignal<boolean | 'partial'> = input<boolean | 'partial'>(false, {
    alias: 'value',
  });
  /** What the box shows: the value input, until a form writes or the user toggles */
  readonly $value: WritableSignal<boolean | 'partial'> = linkedSignal(this.$valueInput);
  /** Emits the value on each toggle by the user; a form's write emits nothing */
  readonly valueChange = output<boolean | 'partial'>();
  /**
   * The loading state of the checkbox.
   * This can be used to indicate that the checkbox is in a loading state, e.g., when data is being fetched.
   */
  readonly $loading = input(false, {
    alias: 'loading',
  });

  /**
   * The value to set when the checkbox is in a partial state and is clicked.
   */
  readonly $valueAfterPartial = input<boolean>(false, {
    alias: 'valueAfterPartial',
  });

  /**
   * The id of the checkbox form field for autocomplete
   */
  readonly $id = input<string | undefined>(generateRandomString(), {
    alias: 'id',
  });
  /**
   * The name of the checkbox form field for autocomplete
   */
  readonly $name = input<string | undefined>('', {
    alias: 'name',
  });
  /**
   * The autocomplete attribute of the checkbox form field
   *  * @default 'off'
   */
  readonly $autocomplete = input<AutoFill>('off', {
    alias: 'autocomplete',
  });

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $hintElement: Signal<HintComponent | undefined> = contentChild(HintComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onChange = (value: boolean) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched = () => {};
  writeValue(value: boolean | 'partial' | null | undefined): void {
    this.$value.set(value ?? false);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.$disabled.set(isDisabled);
  }
  /** Toggles the value as a user would: `'partial'` becomes `valueAfterPartial`, and (valueChange) and the form hear it */
  toggleValue() {
    if (this.$disabled() || this.$loading()) {
      return;
    }
    const checked = this.$value();
    const value = checked === 'partial' ? this.$valueAfterPartial() : !checked;
    this.$value.set(value);
    this.valueChange.emit(value);
    this.onChange(value);
  }

  protected onInputClick(e: MouseEvent) {
    // A click while loading changes nothing; cancelling it keeps the input as it was
    if (this.$loading()) {
      e.preventDefault();
    }
  }

  // The input's change is the one path that toggles: a click on it, on its label or text, and Space all end here
  protected onInputChange(e: Event) {
    this.toggleValue();
    // The browser toggled the input its own way (indeterminate to checked); show the value instead
    const element = e.target as HTMLInputElement;
    const value = this.$value();
    element.checked = value === true;
    element.indeterminate = value === 'partial';
  }

  onKeyDown(e: KeyboardEvent) {
    // Enter toggles too, as it always has here, instead of submitting the form
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).click();
    }
  }
}
