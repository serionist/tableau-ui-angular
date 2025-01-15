import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: 'tab-separator',
    styles: `
    :host {
        background-color: rgba(51, 51, 51, 0.2);
        height: 1px;
        display: block;
    }
`,
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SeparatorComponent {

}