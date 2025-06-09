import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'tab-separator',
    standalone: true,
    template: ``,
    styles: `
        :host {
            background-color: var(--twc-color-border-light);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.width]': '$direction() === "horizontal" ? undefined : "1px"',
        '[style.height]': '$direction() === "vertical" ? undefined : "1px"',
        '[style.display]': '$direction() === "horizontal" ? "block" : "inline-block"',
    },
})
export class SeparatorComponent {
    readonly $direction = input<'horizontal' | 'vertical'>('horizontal', {
        alias: 'direction',
    });
}
