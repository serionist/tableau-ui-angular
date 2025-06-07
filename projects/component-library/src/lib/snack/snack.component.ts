import {
    ChangeDetectionStrategy,
    Component,
    inject,
    model,
    ModelSignal,
    TemplateRef,
} from '@angular/core';
import { SnackRef, TAB_SNACK_REF } from './snack.ref';
import { TAB_SNACK_DATA_REF } from './data.ref';
@Component({
    template: `
        <div class="snack-content" [ngClass]="data.type">
            <div class="content">
                <tab-icon class="icon" [value]="data.type === 'success' ? 'check' : data.type" />
                @if (data.contentTemplate) {
                <div>
                    <ng-container
                        [ngTemplateOutlet]="data.contentTemplate!"
                        [ngTemplateOutletContext]="data.contentTemplateContext"
                    />
                </div>
                } @else {
                <div class="text">
                    {{ data.message }}
                    @if (data.actionLink && data.action) {
                    <a [routerLink]="[]" (click)="data.action(snackRef)">{{
                        data.actionLink
                    }}</a>
                    }
                </div>
                }

                <tab-icon
                    class="close"
                    tabindex="0"
                    value="close"
                    (click)="snackRef.close(true)"
                    (keydown.enter)="snackRef.close(true)"
                    (keydown.space)="snackRef.close(true)"
                />
            </div>
        </div>
    `,
    styles: [
        `
            .snack-content {
                padding: 10px 16px 10px 8px;
            }
            .icon {
                font-size: 1.5em;
            }
            .info .icon {
                color: var(--twc-color-primary);
            }
            .error .icon {
                color: var(--twc-color-error);
            }
            .success .icon {
                color: var(--twc-color-success);
            }
            .content {
                display: flex;
                line-height: 1.5;
            }
            .content div {
                border-right: 1px solid transparent;
                padding: 0 8px;
            }
            .content div.text {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .info .content div {
                border-color: #90d0fe;
            }
            .error .content div {
                border-color: #ffa1a1;
            }
            .success .content div {
                border-color: rgb(147, 206, 147);
            }
            .close {
                font-size: 1.5em;
                margin-left: 0.25em;
                color: var(--twc-color-border-dark);
                cursor: pointer;
            }
            .close:hover {
                background-color: var(--twc-color-border-dark-disabled);
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class SnackComponent<TData = any> {
    protected readonly data = inject<{
        type: 'info' | 'error' | 'success';
        message: string | undefined;
        actionLink: string | undefined;
        action: ((s: SnackRef) => void) | undefined;
        contentTemplate: TemplateRef<TData> | undefined;
        contentTemplateContext: TData;
    }>(TAB_SNACK_DATA_REF);
    protected readonly snackRef = inject(TAB_SNACK_REF);
}
