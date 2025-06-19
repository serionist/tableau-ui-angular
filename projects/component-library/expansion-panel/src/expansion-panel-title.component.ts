import { ChangeDetectionStrategy, Component, Directive } from '@angular/core';

@Component({
  selector: 'tab-expansion-panel-title',
  standalone: false,
  template: ` <ng-content /> `,
  styles: `
    :host {
      align-items: center;
      gap: 0.25rem;
      display: flex;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelTitleComponent {}

@Directive({
  selector: 'tab-expansion-panel-title[expanded]',
  standalone: false,
})
export class ExpansionPanelTitleExpandedContentDirective {}

@Directive({
  selector: 'tab-expansion-panel-title[collapsed]',
  standalone: false,
})
export class ExpansionPanelTitleCollapsedContentDirective {}
