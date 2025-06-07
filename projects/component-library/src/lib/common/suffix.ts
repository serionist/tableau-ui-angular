import { ChangeDetectionStrategy, Component, ElementRef } from "@angular/core";

@Component({
    selector: 'tab-suffix',
    template: `<ng-content />`,
    styles: `
      
      `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
  export class SuffixComponent {
    constructor(public elementRef: ElementRef) {}
  }
  