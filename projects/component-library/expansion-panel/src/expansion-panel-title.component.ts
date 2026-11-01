import { ChangeDetectionStrategy, Component, Directive } from '@angular/core';

/**
 * The panel's title, which names its toggle button for screen readers. A title that holds a control, such as a button,
 * or more than the panel's name needs the panel's `label`: without it the toggle's name is the title's whole text, the
 * control's included, and a search for the control by its name finds the toggle too.
 */
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
