import type { Primitive } from 'tableau-ui-angular/types';
import { LIST_COMPONENT_HOST, ListBaseComponent } from './list-base.component';
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'tab-list-single-select',
    standalone: false,
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ListSingleSelectComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: LIST_COMPONENT_HOST,
})
export class ListSingleSelectComponent<T extends Primitive> extends ListBaseComponent<T, T> {
    protected override selectValueInternal: (currentValue: T | undefined, selectedValue: T) => void = (currentValue, selectedValue) => {
        this.$value.set(selectedValue);
    };
    protected override clearValueInternal: () => void = () => {
        this.$value.set(undefined);
    };
}
