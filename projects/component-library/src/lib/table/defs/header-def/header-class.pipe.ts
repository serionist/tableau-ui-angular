import { Pipe, PipeTransform } from '@angular/core';
import { HeaderContext } from './header-context';

@Pipe({
    name: 'headerClass',
    standalone: false,
})
export class HeaderClassPipe implements PipeTransform {
    transform(ctx: HeaderContext): string | undefined {
        if (typeof ctx.$implicit.$headerClass() === 'string') {
            return ctx.$implicit.$headerClass() as string;
        }
        if (typeof ctx.$implicit.$headerClass() === 'function') {
            return (ctx.$implicit.$headerClass() as (ctx: HeaderContext) => string | undefined)(ctx);
        }
        return undefined;
    }
}
