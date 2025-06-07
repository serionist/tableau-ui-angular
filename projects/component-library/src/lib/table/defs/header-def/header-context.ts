import { ColumnDefDirective } from '../column-def/column-def.directive';

export interface HeaderContext {
    $implicit: ColumnDefDirective;
    index: number;
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
    count: number;
}
