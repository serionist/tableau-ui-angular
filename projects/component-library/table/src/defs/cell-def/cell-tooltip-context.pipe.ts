import type { PipeTransform, TemplateRef } from '@angular/core';
import { Pipe } from '@angular/core';
import type { CellContext, CellTooltipContext } from './cell-context';

@Pipe({
    name: 'cellTooltipContext',
    standalone: false,
})
export class CellTooltipContextPipe implements PipeTransform {
    transform<TData>(cellContext: CellContext<TData>, cellTemplate: TemplateRef<{ $implicit: CellContext<TData> }>): { $implicit: CellTooltipContext<TData> } {
        return {
            $implicit: {
                ...cellContext,
                cellTemplate: cellTemplate,
            },
        };
    }
}
