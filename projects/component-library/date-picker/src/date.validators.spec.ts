import { FormControl } from '@angular/forms';
import { DateValidators } from './date.validators';

describe('DateValidators', () => {
  const min = new Date(2024, 0, 10);
  const max = new Date(2024, 0, 20);

  it('minDate fails a date before it, and passes the day itself and every later one', () => {
    const control = new FormControl<Date | null>(new Date(2024, 0, 9), DateValidators.minDate(min));
    expect(control.errors).toEqual({ minDate: true });

    control.setValue(new Date(2024, 0, 10));
    expect(control.errors).toBeNull();
    control.setValue(new Date(2025, 0, 1));
    expect(control.errors).toBeNull();
  });

  it('maxDate fails a date after it, and passes the day itself and every earlier one', () => {
    const control = new FormControl<Date | null>(new Date(2024, 0, 21), DateValidators.maxDate(max));
    expect(control.errors).toEqual({ maxDate: true });

    control.setValue(new Date(2024, 0, 20));
    expect(control.errors).toBeNull();
    control.setValue(new Date(2023, 0, 1));
    expect(control.errors).toBeNull();
  });

  // An empty value is the required validator's to judge, and a half-typed date is no date yet
  it('pass an empty value and an invalid date', () => {
    const control = new FormControl<Date | null>(null, [DateValidators.minDate(min), DateValidators.maxDate(max)]);
    expect(control.errors).toBeNull();

    control.setValue(new Date(Number.NaN));
    expect(control.errors).toBeNull();
  });
});
