import { ChangeDetectionStrategy, Component, ElementRef } from "@angular/core";

@Component({
    selector: 'tab-prefix',
    template: `<ng-content></ng-content>`,
    styles: `
      
      `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
  export class PrefixComponent {
    constructor(public elementRef: ElementRef) {}
  }
  