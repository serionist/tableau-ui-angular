import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { ColumnDefDirective } from '../column-def/column-def.directive';
import type { HeaderContext } from './header-context';
import type { Primitive } from 'tableau-ui-angular/types';

@Pipe({
    name: 'headerContext',
    standalone: false,
})
export class HeaderContextPipe implements PipeTransform {
    transform<TData, TKey extends Primitive>(value: ColumnDefDirective<TData, TKey>, index: number, first: boolean, last: boolean, even: boolean, odd: boolean, count: number): { $implicit: HeaderContext<TData, TKey> } {
        return {
            $implicit: value.buildHeaderContext(index, first, last, even, odd, count),
        };
    }
}
