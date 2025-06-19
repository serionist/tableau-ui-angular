import type { Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, forwardRef, input, model } from '@angular/core';
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
    '(click)': 'toggleValue()',
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
  readonly $value = model<boolean | 'partial'>(false, {
    alias: 'value',
  });
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
  writeValue(value: boolean): void {
    this.$value.set(value);
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
  toggleValue() {
    if (!this.$disabled() && !this.$loading()) {
      let val = this.$value();
      if (val === 'partial') {
        val = this.$valueAfterPartial();
      } else {
        val = !val;
      }
      this.$value.set(val);
      this.onChange(val);

      this.onTouched();
    }
  }

  onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        this.toggleValue();
        e.preventDefault();
        break;
      default:
        return;
    }
  }
}
