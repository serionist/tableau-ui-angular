import type { DeepPartial } from 'tableau-ui-angular/types';
import { RegisterFnsImpl } from '../../abstract-control/register/impl';
import type { FG } from '../../form-group/interfaces';
import type { FA } from '../interaces';
import type { FaRegisterFns } from './interfaces';
import type { Observable, Subscription } from 'rxjs';
import { combineLatest, filter, map, pairwise, startWith } from 'rxjs';

export class FaRegisterFnsImpl<TItem extends Record<string, unknown>> extends RegisterFnsImpl<FA<TItem>> implements FaRegisterFns<TItem> {
    constructor(
        private readonly fa: FA<TItem>,
        subscriptions: Subscription[] = [],
    ) {
        super(fa, subscriptions);
    }

    /**
     * Registers a callback to be called when the value of the array changes.
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    valueChange(
        callback: (value: DeepPartial<TItem>[], oldValue: DeepPartial<TItem>[] | undefined, controls: FG<TItem>[], control: FA<TItem>) => void,
        alsoRunOnEnabled: boolean = false,
        alsoRunOnDisabled: boolean = false,
    ): FA<TItem> {
        const subs: [Observable<[DeepPartial<TItem>[] | undefined, DeepPartial<TItem>[]]>, Observable<boolean>?] = [
            this.fa.value$.pipe(
                startWith(undefined as unknown as DeepPartial<TItem[]>),
                pairwise(),
                map((v) => [v[0] as DeepPartial<TItem>[] | undefined, (v[1] ?? v[0]) as DeepPartial<TItem>[]]),
            ),
        ];
        if (alsoRunOnEnabled || alsoRunOnDisabled) {
            subs.push(
                this.fa.meta$.pipe(
                    map((e) => e.enabled),
                    filter((enabled) => {
                        if (enabled && alsoRunOnEnabled) {
                            return true;
                        } else if (!enabled && alsoRunOnDisabled) {
                            return true;
                        }
                        return false;
                    }),
                ),
            );
        }
        this.subscriptions.push(
            combineLatest(subs).subscribe(([v]) => {
                callback(v[1], v[0], this.fa.$controls(), this.fa);
            }),
        );
        return this.fa;
    }
}
