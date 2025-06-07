import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import type { IDialogPositionAndSizeArgs } from './dialog.args';

export const TAB_DIALOG_REF = new InjectionToken<DialogRef>('TAB_DIALOG_REF');
export class DialogRef {
    private _closed$ = new Subject<any>();
    closed$: Observable<any> = this._closed$.asObservable();
    dialogElement: HTMLElement = undefined!;

    reposition: (modArgs: (originalArgs: IDialogPositionAndSizeArgs) => void) => void = undefined!;

    private _result: any = undefined;
    close(result?: any): void {
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
    setResultWithoutClosing(result: any): void {
        this._result = result;
    }
}
