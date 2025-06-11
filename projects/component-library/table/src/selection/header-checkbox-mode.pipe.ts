import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';
import type { SingleSelectionOptions } from './selection-options';
import { MultiSelectionOptions } from './selection-options';

@Pipe({
    name: 'headerCheckboxMode',
    standalone: false,
})
export class HeaderCheckboxModePipe<TData, TKey extends Primitive> implements PipeTransform {
    transform(selectionOptions: SingleSelectionOptions<TData, TKey> | MultiSelectionOptions<TData, TKey>): 'none' | 'selectNone' | 'selectAll' | undefined {
        if (selectionOptions instanceof MultiSelectionOptions) {
            switch (selectionOptions.headerCheckboxMode) {
                case 'none':
                    return 'none';
                case 'selectNone':
                    return 'selectNone';
                default:
                    return 'selectAll';
            }
        }
        return 'none';
    }
}
