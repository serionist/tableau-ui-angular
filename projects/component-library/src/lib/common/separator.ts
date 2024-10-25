import { Component } from "@angular/core";

@Component({
    selector: 'tab-separator',
    standalone: true,
    styles: `
    :host {
        width: calc(100% - 2em);
        background-color: rgba(51, 51, 51, 0.2);
        height: 1px;
        margin-bottom: 1.5em;
        margin-left: 1em;
        margin-right: 1em;
        margin-top: 1.5em;
        display: block;
    }
`,
    template: ``
})
export class SeparatorComponent {

}