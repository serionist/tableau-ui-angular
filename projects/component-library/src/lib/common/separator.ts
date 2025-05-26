import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
    selector: 'tab-separator',
    styles: `
    :host {
        background-color: rgba(51, 51, 51, 0.2);
    }
`,
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
    host: {
        '[style.width]': 'direction() === "horizontal" ? undefined : "1px"',
        '[style.height]': 'direction() === "vertical" ? undefined : "1px"',
        '[style.display]': 'direction() === "horizontal" ? "block" : "inline-block"',
    }
})
export class SeparatorComponent {

    readonly direction = input<'horizontal' | 'vertical'>('horizontal');
}