import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { CellContext } from './cell-context';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
    name: 'cellClass',
    standalone: false,
})
export class CellClassPipe implements PipeTransform {
    transform<TData, TKey extends Primitive>(ctx: CellContext<TData, TKey>): string | undefined {
        if (typeof ctx.meta.columnDef.$cellClass() === 'string') {
            return ctx.meta.columnDef.$cellClass() as string;
        }
        if (typeof ctx.meta.columnDef.$cellClass() === 'function') {
            return (ctx.meta.columnDef.$cellClass() as (ctx: CellContext<TData, TKey>) => string | undefined)(ctx);
        }
        return undefined;
    }
}
