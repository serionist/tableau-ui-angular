import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';

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
export class TabComponent<TKey extends Primitive> {
    readonly $headerTemplate = viewChild.required<TemplateRef<unknown>>('headerTemplate');
    readonly $contentTemplate = viewChild.required<TemplateRef<unknown>>('contentTemplate');

    readonly $disabled = input<boolean>(false, {
        alias: 'disabled',
    });

    /**
     * Optional key if we want to select this tab with a key instead of index.
     */
    readonly $key = input<TKey | undefined>(undefined, {
        alias: 'key',
    });

    readonly afterActivate = output();
}
