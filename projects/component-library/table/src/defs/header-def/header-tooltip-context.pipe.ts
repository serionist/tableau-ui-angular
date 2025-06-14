import type { PipeTransform, TemplateRef } from '@angular/core';
import { Pipe } from '@angular/core';
import type { HeaderContext, HeaderTooltipContext } from './header-context';
import type { SortOrderPair } from '../column-def/column-def.directive';
import type { DataSort } from '../../sorting/data-sort';

@Pipe({
    name: 'headerTooltipContext',
    standalone: false,
})
export class HeaderTooltipContextPipe implements PipeTransform {
    transform<TData>(
        headerContext: HeaderContext<TData>,
        headerTemplate: TemplateRef<{ $implicit: HeaderContext<TData> }>,
        sortMode: 'multi' | 'single',
        sortable: boolean,
        sortOrder: SortOrderPair,
        currentSort: { info: DataSort; index: number } | undefined,
        allSorts: DataSort[],
    ): { $implicit: HeaderTooltipContext<TData> } {
        return {
            $implicit: {
                ...headerContext,
                headerTemplate,
                sortMode,
                sortable,
                sortOrder,
                currentSort,
                allSorts,
            },
        };
    }
}
