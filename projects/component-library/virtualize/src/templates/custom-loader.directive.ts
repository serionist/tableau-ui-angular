import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[tabCustomLoader]',
  standalone: false,
})
export class CustomLoaderDirective {
  public templateRef = inject<TemplateRef<unknown>>(TemplateRef<unknown>);
}
