import { CommonModule } from '@angular/common';
import { Component, ElementRef, input, model } from '@angular/core';

@Component({
  selector: 'tab-hint',
  template: `<div class="tab-hint" [ngClass]="type()"><ng-content></ng-content></div>`,
    styles: `
        .tab-hint {
            font-size: 0.9em;
            color: var(--twc-color-text-gray);
        }
    `
})
export class HintComponent {
    type = input<'prefix' | 'suffix'>('prefix');
    constructor(public elementRef: ElementRef) {}

}
