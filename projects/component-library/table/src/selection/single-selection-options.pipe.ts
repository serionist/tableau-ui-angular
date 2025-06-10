import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { MultiSelectionOptions } from './selection-options';
import { SingleSelectionOptions } from './selection-options';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
    name: 'singleSelectionOptions',
    standalone: false,
})
export class SingleSelectionOptionsPipe<TData, TKey extends Primitive> implements PipeTransform {
    transform(selectionOptions: SingleSelectionOptions<TData, TKey> | MultiSelectionOptions<TData, TKey>): SingleSelectionOptions<TData, TKey> | undefined {
        if (selectionOptions instanceof SingleSelectionOptions) {
            return selectionOptions;
        }
        return undefined;
    }
}
