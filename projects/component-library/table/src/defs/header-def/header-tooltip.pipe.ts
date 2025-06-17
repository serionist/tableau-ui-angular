import type { PipeTransform, TemplateRef } from '@angular/core';
import { Pipe } from '@angular/core';
import type { TooltipArgs } from 'tableau-ui-angular/tooltip';
import type { HeaderToolipDefDirective } from './header-toolip-def.directive';

import type { HeaderContext, HeaderTooltipContext } from './header-context';
import type { Primitive } from 'tableau-ui-angular/types';
import type { SortOrderPair } from '../column-def/column-def.directive';
import type { DataSort } from '../../sorting/data-sort';

@Pipe({
    name: 'headerTooltip',
    standalone: false,
})
export class HeaderTooltipPipe implements PipeTransform {
    transform<TData, TKey extends Primitive>(
        customTooltipDef: HeaderToolipDefDirective<TData, TKey> | undefined,
        headerContext: HeaderContext<TData>,
        showAutoHeaderTooltip: boolean,
        autoHeaderTooltipTemplate: TemplateRef<{ $implicit: HeaderTooltipContext<TData> }>,
        contextParams: {
            headerTemplate: TemplateRef<{ $implicit: HeaderContext<TData> }>;
            sortMode: 'multi' | 'single';
            sortable: boolean;
            sortOrder: SortOrderPair;
            currentSort: { info: DataSort; index: number } | undefined;
            allSorts: DataSort[];
        },
    ): TooltipArgs<{ $implicit: HeaderTooltipContext<TData> }> {
        const tooltipArgs: TooltipArgs<{ $implicit: HeaderTooltipContext<TData> }> = {
            template: undefined,
            position: 'top',
            margin: '1rem',
            context: {
                $implicit: {
                    ...headerContext,
                    ...contextParams,
                },
            },
        };

        // if we have a custom [tabHeaderTooltipDef] directive in our column definition
        if (customTooltipDef) {
            // check if user has provided a value to show the custom tooltip
            // this can be a boolean or a function that returns a boolean
            const showCustomParam = customTooltipDef.$showTooltip();
            let showCustomTooltip: boolean;
            // if its a function, call it with the header context to see if we need to show the custom tooltip
            if (typeof showCustomParam === 'function') {
                showCustomTooltip = showCustomParam(headerContext);
            } else {
                // if its a boolean, use it directly
                showCustomTooltip = showCustomParam;
            }
            // if we show custom tooltip, use the custom template
            if (showCustomTooltip) {
                tooltipArgs.template = customTooltipDef.templateRef;
                tooltipArgs.position = customTooltipDef.$tooltipPosition();
                tooltipArgs.margin = customTooltipDef.$tooltipMargin();
            }
        }

        // if we have not set tooltipArgs.template yet,
        // it means we are not showing a custom tooltip
        if (tooltipArgs.template === undefined) {
            // if we are showing the auto header tooltip, use the auto template
            if (showAutoHeaderTooltip) {
                tooltipArgs.template = autoHeaderTooltipTemplate;
            }
        }

        // return the tooltip args
        return tooltipArgs;
    }
}
