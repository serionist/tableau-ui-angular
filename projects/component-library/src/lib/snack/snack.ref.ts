import { inject, InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export const TAB_SNACK_REF = new InjectionToken<SnackRef>('TAB_SNACK_REF');
export function injectSnackRef<T>(): SnackRef<T> {
    return inject(TAB_SNACK_REF) as SnackRef<T>;
}
export interface ISnackRef {
    closed$: Observable<unknown | undefined>;
    close: () => void;
}
export class SnackRef<T = unknown> implements ISnackRef {
    private readonly _closed$ = new Subject<T | undefined>();
    readonly closed$: Observable<T | undefined> = this._closed$.asObservable();

    private _result: T | undefined = undefined;
    close(result?: T): void {
        this._closed$.next(result ?? this._result);
        this._closed$.complete();
    }

    /**
     * Sets the result of the dialog without closing it.
     * This is useful for cases where you want to update the result
     * but keep the dialog open, such as in a form submission.
     * If the close() function is called with a non-undefined result, it will overwrite this value
     * @param result The result to set.
     */
    setResultWithoutClosing(result?: T): void {
        this._result = result;
    }
}
