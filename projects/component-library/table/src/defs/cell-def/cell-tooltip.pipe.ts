import type { PipeTransform, TemplateRef } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';
import type { CellToolipDefDirective } from './cell-toolip-def.directive';
import type { CellContext, CellTooltipContext } from './cell-context';
import type { TooltipArgs } from 'tableau-ui-angular/tooltip';

@Pipe({
    name: 'cellTooltip',
    standalone: false,
})
export class CellTooltipPipe implements PipeTransform {
    transform<TData, TKey extends Primitive>(
        customTooltipDef: CellToolipDefDirective<TData, TKey> | undefined,
        blockStatus: 'canceled' | 'error' | 'loading' | 'success',
        cellContext: CellContext<TData>,
        showAutoCellTooltip: boolean,
        cellTemplate: TemplateRef<{ $implicit: CellContext<TData> }>,
        isClamped: boolean,
    ): TooltipArgs<{ $implicit: CellTooltipContext<TData> }> {
        const tooltipArgs: TooltipArgs<{ $implicit: CellTooltipContext<TData> }> = {
            template: undefined,
            position: 'top',
            margin: '0.5rem',
            context: {
                $implicit: {
                    ...cellContext,
                    cellTemplate,
                },
            },
        };
        // if the cell's block is not loaded yet, we don't show the tooltip
        if (blockStatus !== 'success') {
            return tooltipArgs;
        }
        // if we have a custom [tabCellTooltipDef] directive in our column definition
        if (customTooltipDef) {
            // check if user has provided a value to show the custom tooltip
            // this can be a boolean or a function that returns a boolean
            const showCustomParam = customTooltipDef.$showTooltip();
            let showCustomTooltip: boolean;
            // if its a function, call it with the header context to see if we need to show the custom tooltip
            if (typeof showCustomParam === 'function') {
                showCustomTooltip = showCustomParam(cellContext);
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
        // check if we have auto tooltip enabled and we have clamped the cell context
        if (tooltipArgs.template === undefined && showAutoCellTooltip && isClamped) {
            tooltipArgs.template = cellTemplate as TemplateRef<{ $implicit: CellTooltipContext<TData> }>;
        }

        return tooltipArgs;
    }
}
