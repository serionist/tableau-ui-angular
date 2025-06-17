import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { HeaderContext } from './header-context';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
    name: 'headerClass',
    standalone: false,
})
export class HeaderClassPipe implements PipeTransform {
    transform<TData, TKey extends Primitive>(ctx: HeaderContext<TData, TKey>): string | undefined {
        if (typeof ctx.columnDef.$headerClass() === 'string') {
            return ctx.columnDef.$headerClass() as string;
        }
        if (typeof ctx.columnDef.$headerClass() === 'function') {
            return (ctx.columnDef.$headerClass() as (ctx: HeaderContext<TData, TKey>) => string | undefined)(ctx);
        }
        return undefined;
    }
}
