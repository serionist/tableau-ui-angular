import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'tab-prefix',
  standalone: false,
  template: ` <ng-content /> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrefixComponent {
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
