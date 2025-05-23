import { ChangeDetectionStrategy, Component, Directive } from "@angular/core";

@Component({
    selector: 'tab-expansion-panel-title',
    template: `<ng-content></ng-content>`,
    styles: `
        :host {
            align-items: center;
            gap: 0.25rem;
            display: flex;
        }
    `,
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelTitleComponent {

}

@Directive({
    selector: 'tab-expansion-panel-title[expanded]',
    standalone: false,
})
export class ExpansionPanelTitleExpandedContent {

}

@Directive({
    selector: 'tab-expansion-panel-title[collapsed]',
    standalone: false,
})
export class ExpansionPanelTitleCollapsedContent {

}