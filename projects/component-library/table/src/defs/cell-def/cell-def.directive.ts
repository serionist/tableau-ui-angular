import { Directive, inject, TemplateRef } from '@angular/core';
import type { CellContext } from './cell-context';

@Directive({
    selector: '[tabCellDef]',
    standalone: false,
})
export class CellDefDirective<T = unknown> {
    public templateRef = inject(TemplateRef<CellContext<T>>);
}
