import { ChangeDetectionStrategy, Component, Directive } from '@angular/core';

@Component({
    selector: 'tab-expansion-panel-title',
    standalone: true,
    template: `
        <ng-content />
    `,
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
    standalone: true,
})
export class ExpansionPanelTitleExpandedContentDirective {}

@Directive({
    selector: 'tab-expansion-panel-title[collapsed]',
    standalone: true,
})
export class ExpansionPanelTitleCollapsedContentDirective {}
