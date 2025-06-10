import type { Signal } from '@angular/core';
import { Component, forwardRef, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Primitive } from 'tableau-ui-angular/types';
import { SELECT_COMPONENT_HOST, SelectBaseComponent } from './select-base.component';

@Component({
    selector: 'tab-multi-select',
    standalone: false,
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelectComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: SELECT_COMPONENT_HOST,
})
export class MultiSelectComponent<T extends Primitive> extends SelectBaseComponent<T, T[]> {

    protected override $isMultiSelect(): this is MultiSelectComponent<T> {
        return true;
    }
    /**
     * The maximum number of items to display in the selected value field when multiple items are selected
     * @default 2
     */
    readonly $multipleSelectionMaxItemsListed = input<number>(2, {
        alias: 'multipleSelectionMaxItemsListed',
    });
    /**
     * The display template to use when more than the maximum number of items selected
     * @remarks
     * Use {number} as a placeholder for the number of items selected
     */
    readonly $multipleSelectionNumberSelectedTemplate = input<string>('{number} items selected', {
        alias: 'multipleSelectionNumberSelectedTemplate',
    });

    override readonly $hasValue: Signal<boolean> = computed(() => {
        const value = this.$value();
        if (value === undefined) {
            return false;
        }
        if (!Array.isArray(value)) {
            return false;
        }
        return value.length > 0;
    });

    protected override selectValueInternal: (currentValue: T[] | undefined, selectedValue: T) => void = (currentValue, selectedValue) => {
        if (currentValue === undefined || !Array.isArray(currentValue)) {
            this.$value.set([selectedValue]);
        } else if (!currentValue.includes(selectedValue)) {
            this.$value.set([...currentValue, selectedValue]);
        } else {
            this.$value.set(currentValue.filter((e) => e !== selectedValue));
        }
    };

    protected override clearValueInternal: () => void = () => {
        this.$value.set([]);
    };
}
