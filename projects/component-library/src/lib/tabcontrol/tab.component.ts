import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    input,
    TemplateRef,
    viewChild,
    ViewChild,
} from '@angular/core';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tab',
    template: `
        <ng-template #headerTemplate>
            <ng-content select="[tab-header]"></ng-content>
        </ng-template>
        <ng-template #contentTemplate>
            <ng-content></ng-content>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TabComponent {
    headerTemplate = viewChild.required<TemplateRef<any>>('headerTemplate');
    contentTemplate = viewChild.required<TemplateRef<any>>('contentTemplate');

    disabled = input<boolean>(false);
}
