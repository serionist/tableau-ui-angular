import type { Primitive } from 'tableau-ui-angular/types';
import { SELECT_COMPONENT_HOST, SelectBaseComponent } from './select-base.component';
import type { Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tab-single-select',
  standalone: false,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SingleSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: SELECT_COMPONENT_HOST,
})
export class SingleSelectComponent<T extends Primitive> extends SelectBaseComponent<T, T> {
  // null is no value: a form's reset() writes it
  override readonly $hasValue: Signal<boolean> = computed(() => {
    const value = this.$value();
    return value !== undefined && value !== null;
  });
  protected override selectValueInternal: (currentValue: T | undefined, selectedValue: T) => void = (currentValue, selectedValue) => {
    this.$value.set(selectedValue);
  };
  protected override clearValueInternal: () => void = () => {
    this.$value.set(undefined);
  };
}
