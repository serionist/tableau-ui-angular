import type { AbstractControl } from '@angular/forms';

export class DateValidators {
  static minDate(minDate: Date) {
    return (ctrl: AbstractControl) => {
      if (ctrl.value !== undefined && ctrl.value !== null && ctrl.value instanceof Date && !isNaN(ctrl.value.getTime())) {
        const date: Date = ctrl.value;
        if (date < minDate) {
          return { minDate: true };
        }
      }
      return null;
    };
  }
  static maxDate(maxDate: Date) {
    return (ctrl: AbstractControl) => {
      if (ctrl.value !== undefined && ctrl.value !== null && ctrl.value instanceof Date && !isNaN(ctrl.value.getTime())) {
        const date: Date = ctrl.value;
        if (date > maxDate) {
          return { maxDate: true };
        }
      }
      return null;
    };
  }
}
