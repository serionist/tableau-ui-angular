import { CommonModule } from '@angular/common';
import { Component, ElementRef, input } from '@angular/core';

@Component({
  selector: 'tab-hint',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="tab-hint" [ngClass]="type()"><ng-content></ng-content></div>`,
    styles: `
        .tab-hint {
            font-size: 0.9em;
            color: var(--twc-color-text-gray);
        }
    `
})
export class FormHintComponent {

    type = input<'prefix' | 'suffix'>('prefix');
    constructor(public elementRef: ElementRef) {}

}
