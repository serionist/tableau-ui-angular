import {
    ChangeDetectionStrategy,
    Component,
    inject,
    model,
    ModelSignal,
    TemplateRef,
} from '@angular/core';
import { TAB_SNACK_REF } from './snack.ref';
import { TAB_SNACK_DATA_REF } from './data.ref';
@Component({
    template: `
        <div class="snack-content" [ngClass]="data.type">
            <div class="content">
                <tab-icon class="icon" value="{{ data.type }}"></tab-icon>
                <div *ngIf="data.contentTemplate; else textContent">
                    <ng-container
                        [ngTemplateOutlet]="data.contentTemplate!"
                        [ngTemplateOutletContext]="data.contentTemplateContext"
                    ></ng-container>
                </div>
                <ng-template #textContent>
                    <div>{{ data.message }}</div>
                </ng-template>

                <tab-icon
                    class="close"
                    tabindex="0"
                    (click)="snackRef.close(true)"
                    (keydown.enter)="snackRef.close(true)"
                    (keydown.space)="snackRef.close(true)"
                    value="close"
                ></tab-icon>
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
            .content {
                display: flex;
                line-height: 1.5;
            }
            .content div {
                border-right: 1px solid transparent;
                padding: 0 8px;
            }
            .info .content div {
                border-color: #90d0fe;
            }
            .error .content div {
                border-color: #ffa1a1;
            }
            .close {
                font-size: 1.5em;
                margin-left: 0.25em;
                color: #2e2e2e;
                cursor: pointer;
            }
            .close:hover {
                background-color: #aeaeae;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class SnackComponent<TData extends any = any> {
    data = inject<{
        type: 'info' | 'error';
        message: string | undefined;
        contentTemplate: TemplateRef<TData> | undefined;
        contentTemplateContext: TData;
    }>(TAB_SNACK_DATA_REF);
    snackRef = inject(TAB_SNACK_REF);
}
