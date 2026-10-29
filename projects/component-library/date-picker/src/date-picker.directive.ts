import type { InputSignal, WritableSignal } from '@angular/core';
import { computed, Directive, effect, ElementRef, forwardRef, HostListener, inject, input, linkedSignal, output } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[type=date],input[type=datetime-local],input[type=datetime],input[date-picker]',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerDirective),
      multi: true,
    },
  ],
  host: {
    class: 'date-picker',
    '[attr.type]': '$dateTime() ? "datetime-local" : "date"',
  },
})
export class DatePickerDirective implements ControlValueAccessor {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  // type can only be set once. Cannot change between date and datetime
  readonly $type = input.required<'date' | 'datetime' | 'datetime-local'>({
    alias: 'type',
  });
  // datetime and datetime-local both take a date and a time
  protected readonly $dateTime = computed(() => this.$type() !== 'date');
  private originalType: boolean | undefined;
  private readonly typeChanged = effect(() => {
    this.originalType ??= this.$dateTime();
    if (this.$dateTime() !== this.originalType) {
      throw new Error('DatePickerDirective: type must be "date" or "datetime", can not be changed later');
    }
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $valueInput: InputSignal<Date | undefined> = input<Date | undefined>(undefined, {
    alias: 'value',
  });
  readonly $value: WritableSignal<Date | undefined> = linkedSignal(this.$valueInput);
  readonly valueChange = output<Date | undefined>();

  // The value, bound or set, is what the element shows
  private readonly valueShown = effect(() => {
    this.show(this.$value());
  });

  @HostListener('input')
  onInput() {
    const val = this.parse(this.el.nativeElement.value);
    this.$value.set(val);
    this.valueChange.emit(val);
    this._onChange(val);
  }
  // Touched when the user leaves the input, as Angular's own inputs are, which commits an updateOn: 'blur' change
  @HostListener('blur')
  onBlur() {
    this._onTouched();
  }

  writeValue(obj: Date | null | undefined): void {
    const value = obj instanceof Date && !isNaN(obj.getTime()) ? obj : undefined;
    this.$value.set(value);
    this.show(value);
  }

  // Writes the value to the element, unless the element shows it already, so a date the user is still typing stays
  private show(value: Date | undefined) {
    if (this.parse(this.el.nativeElement.value)?.getTime() === value?.getTime()) {
      return;
    }
    this.el.nativeElement.value = value ? this.format(value) : '';
  }

  private parse(text: string): Date | undefined {
    // A date alone is that day at local midnight; new Date('2025-03-15') would be midnight UTC, the day before west of it
    const day = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(text);
    let date: Date;
    if (day) {
      date = new Date(0);
      date.setFullYear(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
      date.setHours(0, 0, 0, 0);
    } else {
      // a date and time with no offset, as datetime-local gives it, is local time
      date = new Date(text);
    }
    return text === '' || isNaN(date.getTime()) ? undefined : date;
  }

  private format(value: Date): string {
    const year = value.getFullYear();
    const month = (value.getMonth() + 1).toString().padStart(2, '0');
    const day = value.getDate().toString().padStart(2, '0');
    if (!this.$dateTime()) {
      return `${year}-${month}-${day}`;
    }
    const hours = value.getHours().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  private _onChange = (value: Date | undefined) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};
  registerOnChange(fn: (date: Date | undefined) => void): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }
}
