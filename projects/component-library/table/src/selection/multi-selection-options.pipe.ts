import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';
import type { SingleSelectionOptions } from './selection-options';
import { MultiSelectionOptions } from './selection-options';

@Pipe({
    name: 'multiSelectionOptions',
    standalone: false,
})
export class MultiSelectionOptionsPipe<TData, TKey extends Primitive> implements PipeTransform {
    transform(selectionOptions: SingleSelectionOptions<TData, TKey> | MultiSelectionOptions<TData, TKey>): MultiSelectionOptions<TData, TKey> | undefined {
        console.log(selectionOptions, selectionOptions instanceof MultiSelectionOptions);
        if (selectionOptions instanceof MultiSelectionOptions) {
            return selectionOptions;
        }
        return undefined;
    }
}
