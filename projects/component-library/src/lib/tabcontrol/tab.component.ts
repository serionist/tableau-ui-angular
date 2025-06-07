import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, input, TemplateRef, viewChild, ViewChild } from '@angular/core';

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
    readonly $headerTemplate = viewChild.required<TemplateRef<any>>('headerTemplate');
    readonly $contentTemplate = viewChild.required<TemplateRef<any>>('contentTemplate');

    readonly $disabled = input<boolean>(false, {
        alias: 'disabled',
    });
}
