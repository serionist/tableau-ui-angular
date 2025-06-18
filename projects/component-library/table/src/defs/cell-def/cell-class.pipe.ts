import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { CellContext } from './cell-context';

@Pipe({
    name: 'cellClass',
    standalone: false,
})
export class CellClassPipe implements PipeTransform {
    transform<TData>(ctx: CellContext<TData>): string | undefined {
        if (typeof ctx.meta.columnDef.$cellClass() === 'string') {
            return ctx.meta.columnDef.$cellClass() as string;
        }
        if (typeof ctx.meta.columnDef.$cellClass() === 'function') {
            return (ctx.meta.columnDef.$cellClass() as (ctx: CellContext<TData>) => string | undefined)(ctx);
        }
        return undefined;
    }
}
