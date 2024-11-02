import { ChangeDetectionStrategy, Component, ElementRef } from "@angular/core";

@Component({
    selector: 'tab-suffix',
    template: `<ng-content></ng-content>`,
      styles: `
      
      `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class SuffixComponent {
    constructor(public elementRef: ElementRef) {}
  }
  