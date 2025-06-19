import type { PipeTransform, TemplateRef } from '@angular/core';
import { Pipe } from '@angular/core';
import type { CellContext, CellTooltipContext } from './cell-context';
import type { TooltipArgs } from 'tableau-ui-angular/tooltip';
import type { DataBlock } from '../../data/data-block';
import type { ColumnDefDirective } from '../column-def/column-def.directive';

@Pipe({
    name: 'cellTooltip',
    standalone: false,
})
export class CellTooltipPipe implements PipeTransform {
    transform<TData>(
        cellElement: HTMLDivElement,
        columnDef: ColumnDefDirective<TData>,
        cellContext: CellContext<TData>,
        block: DataBlock<TData>,
    ): () => TooltipArgs<{ $implicit: CellTooltipContext<TData> }> {
        return () => {
            const tooltipArgs: TooltipArgs<{ $implicit: CellTooltipContext<TData> }> = {
                template: undefined,
                position: 'bottom',
                margin: '0px',
                context: {
                    $implicit: {
                        ...cellContext,
                        cellTemplate: columnDef.$cell().templateRef,
                        isRowCellClamped: false,
                    },
                },
            };
            // if the cell's block is not loaded yet, we don't show the tooltip
            if (block.$status() !== 'success') {
                return tooltipArgs;
            }
            // if we have a custom [tabCellTooltipDef] directive in our column definition
            const tooltipDef = columnDef.$cellTooltip();
            if (tooltipDef !== undefined) {
                const isClamped = this.isClamped(cellElement);
                // check if user has provided a value to show the custom tooltip
                // this can be a boolean or a function that returns a boolean
                const showCustomParam = tooltipDef.$showTooltip();
                let showCustomTooltip: boolean;
                // if its a function, call it with the header context to see if we need to show the custom tooltip
                if (typeof showCustomParam === 'function') {
                    
                    showCustomTooltip = showCustomParam(cellContext, isClamped);
                } else {
                    // if its a boolean, use it directly
                    showCustomTooltip = showCustomParam;
                }
                // if we show custom tooltip, use the custom template
                if (showCustomTooltip) {
                    tooltipArgs.context!.$implicit.isRowCellClamped = isClamped;
                    tooltipArgs.template = tooltipDef.templateRef;
                    tooltipArgs.position = tooltipDef.$tooltipPosition();
                    tooltipArgs.margin = tooltipDef.$tooltipMargin();
                }
            }

            // if we have not set tooltipArgs.template yet,
            // it means we are not showing a custom tooltip
            // check if we have auto tooltip enabled and we have clamped the cell context
            if (tooltipArgs.template === undefined && columnDef.$showAutoCellTooltip()) {
                // check if the cell is clamped
                const isClamped = this.isClamped(cellElement);
                // if the cell is clamped, we show the auto tooltip
                if (isClamped) {
                    // use the cell template as the tooltip template
                    const cellTemplate = columnDef.$cell().templateRef;
                    tooltipArgs.template = cellTemplate as TemplateRef<{ $implicit: CellTooltipContext<TData> }>;
                }
            }

            return tooltipArgs;
        };
    }

    isClamped(cellElement: HTMLDivElement): boolean {
        const clampElement = cellElement.querySelector('.line-clamp');
        return clampElement !== null && clampElement.scrollHeight > clampElement.clientHeight;
    }
}
