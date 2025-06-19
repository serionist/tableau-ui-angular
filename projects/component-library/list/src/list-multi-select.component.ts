import type { Primitive } from 'tableau-ui-angular/types';
import { LIST_COMPONENT_HOST, ListBaseComponent } from './list-base.component';
import { Component, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tab-list-multi-select',
  standalone: false,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListMultiSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: LIST_COMPONENT_HOST,
})
export class ListMultiSelectComponent<T extends Primitive> extends ListBaseComponent<T, T[]> {
  protected override $isMultiSelect(): this is ListMultiSelectComponent<T> {
    return true;
  }

  protected override selectValueInternal: (currentValue: T[] | undefined, selectedValue: T) => void = (currentValue, selectedValue) => {
    if (currentValue === undefined || !Array.isArray(currentValue)) {
      this.$value.set([selectedValue]);
    } else if (!currentValue.includes(selectedValue)) {
      this.$value.set([...currentValue, selectedValue]);
    } else {
      this.$value.set(currentValue.filter(e => e !== selectedValue));
    }
  };

  protected override clearValueInternal: () => void = () => {
    this.$value.set([]);
  };
}
