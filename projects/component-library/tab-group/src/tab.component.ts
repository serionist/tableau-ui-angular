import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tab',
    standalone: false,
    template: `
        <ng-template #headerTemplate>
            <ng-content select="[tab-header]" />
        </ng-template>
        <ng-template #contentTemplate>
            <ng-content />
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
    readonly $headerTemplate = viewChild.required<TemplateRef<unknown>>('headerTemplate');
    readonly $contentTemplate = viewChild.required<TemplateRef<unknown>>('contentTemplate');

    readonly $disabled = input<boolean>(false, {
        alias: 'disabled',
    });

    readonly afterActivate = output();

}
