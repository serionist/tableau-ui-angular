import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ColumnDefDirective } from '../column-def/column-def.directive';
import type { HeaderContext } from './header-context';

@Pipe({
    name: 'headerContext',
    standalone: false,
})
export class HeaderContextPipe implements PipeTransform {
    transform<TData>(value: ColumnDefDirective<TData>, index: number, first: boolean, last: boolean, even: boolean, odd: boolean, count: number): { $implicit: HeaderContext<TData> } {
        return {
            $implicit: {
                columnDef: value,
                meta: {
                    index: index,
                    first: first,
                    last: last,
                    even: even,
                    odd: odd,
                    count: count,
                },
            },
        };
    }
}
