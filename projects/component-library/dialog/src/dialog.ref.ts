import { inject, InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import type { IDialogPositionAndSizeArgs } from './dialog.args';

export const TAB_DIALOG_REF = new InjectionToken<DialogRef>('TAB_DIALOG_REF');

export function injectDialogRef<T>(): DialogRef<T> {
  return inject(TAB_DIALOG_REF) as DialogRef<T>;
}

export interface IDialogRef {
  closed$: Observable<unknown | undefined>;
  close: () => void;
}
export class DialogRef<T = unknown> implements IDialogRef {
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
export class DialogRefInternal<T> extends DialogRef<T> {
  dialogElement: HTMLElement = undefined!;

  reposition: (modArgs: (originalArgs: IDialogPositionAndSizeArgs) => void) => void = undefined!;
}
