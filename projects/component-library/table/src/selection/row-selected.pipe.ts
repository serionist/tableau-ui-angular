import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';
import { MultiSelectionOptions } from './selection-options';
import { SingleSelectionOptions } from './selection-options';

@Pipe({
    name: 'rowSelected',
    standalone: false,
})
export class RowSelectedPipe<TData, TKey extends Primitive> implements PipeTransform {
    transform(row: TData, selectedKeys: TKey[], selectionOptions: SingleSelectionOptions<TData, TKey> | MultiSelectionOptions<TData, TKey>): boolean {
        if (selectionOptions instanceof MultiSelectionOptions) {
            const key = selectionOptions.getRowKey(row);
            return selectedKeys.includes(key);
        } else if (selectionOptions instanceof SingleSelectionOptions) {
            const key = selectionOptions.getRowKey(row);
            return selectedKeys.includes(key);
        }
        return false;
    }
}
