import { Directive, inject, TemplateRef } from '@angular/core';
import type { HeaderContext } from './header-context';

@Directive({
    selector: '[tabHeaderDef]',
    standalone: false,
})
export class HeaderDefDirective {
    public templateRef = inject(TemplateRef<HeaderContext>);
}
