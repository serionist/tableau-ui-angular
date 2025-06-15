import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { HeaderContext } from './header-context';

@Pipe({
    name: 'showHeaderTooltip',
    standalone: false,
})
export class ShowHeaderTooltipPipe implements PipeTransform {
    transform<TData>(showTooltip: boolean | ((ctx: HeaderContext<TData>) => boolean), context: HeaderContext<TData>): boolean {
        if (typeof showTooltip === 'function') {
            return showTooltip(context);
        } else {
            return showTooltip;
        }
    }
}
