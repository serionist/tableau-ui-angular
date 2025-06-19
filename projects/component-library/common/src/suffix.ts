import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'tab-suffix',
  standalone: false,
  template: ` <ng-content /> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuffixComponent {
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
