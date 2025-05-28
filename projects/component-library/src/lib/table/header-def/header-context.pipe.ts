import { Pipe, PipeTransform } from '@angular/core';
import { ColumnDefDirective } from '../column-def/column-def.directive';
import { HeaderContext } from './header-context';

@Pipe({
    name: 'headerContext',
    standalone: false,
})
export class HeaderContextPipe implements PipeTransform {
    transform(
        value: ColumnDefDirective,
        index: number,
        first: boolean,
        last: boolean,
        even: boolean,
        odd: boolean,
        count: number
    ): HeaderContext {
        return {
            $implicit: value,
            index: index,
            first: first,
            last: last,
            even: even,
            odd: odd,
            count: count,
        }
    }
}
