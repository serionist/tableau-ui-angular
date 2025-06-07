import { Pipe, PipeTransform } from '@angular/core';
import { CellContext } from './cell-context';

@Pipe({
    name: 'cellClass',
    standalone: false,
})
export class CellClassPipe implements PipeTransform {
    transform<T>(ctx: CellContext<T>): string | undefined {
        if (typeof ctx.columnDef.$cellClass() === 'string') {
            return ctx.columnDef.$cellClass() as string;
        }
        if (typeof ctx.columnDef.$cellClass() === 'function') {
            return (
                ctx.columnDef.$cellClass() as (
                    ctx: CellContext<T>
                ) => string | undefined
            )(ctx);
        }
        return undefined;
    }
}
