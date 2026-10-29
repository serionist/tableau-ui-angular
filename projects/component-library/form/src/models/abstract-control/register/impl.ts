import type { DestroyRef } from '@angular/core';
import type { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, skip, startWith, switchMap } from 'rxjs';
import type { ACImpl } from '../impl';
import type { AC } from '../interfaces';
import type { RegisterFns } from './interfaces';
import type { Meta } from '../meta/interfaces';

/**
 * `value$`, and its latest value again each time the control becomes enabled (`alsoRunOnEnabled`) or disabled
 * (`alsoRunOnDisabled`). A meta change that leaves `enabled` as it was, such as touched or dirty, emits nothing.
 */
export function alsoOnEnabledChange<T>(value$: Observable<T>, meta$: Observable<Meta>, alsoRunOnEnabled: boolean, alsoRunOnDisabled: boolean): Observable<T> {
  if (!alsoRunOnEnabled && !alsoRunOnDisabled) {
    return value$;
  }
  const toggled$ = meta$.pipe(
    map(meta => meta.enabled),
    distinctUntilChanged(),
    // meta$ replays the current state, which is no change
    skip(1),
    filter(enabled => (enabled ? alsoRunOnEnabled : alsoRunOnDisabled)),
  );
  return value$.pipe(
    switchMap(value =>
      toggled$.pipe(
        map(() => value),
        startWith(value),
      ),
    ),
  );
}

export class RegisterFnsImpl<TChild> implements RegisterFns<TChild> {
  constructor(
    private readonly fgControl: AC,
    protected subscriptions: Subscription[],
  ) {}

  /** Calls `callback` with each value of `source$` until the form's destroy(), or until `destroyRef` is destroyed. */
  protected watch<T>(source$: Observable<T>, callback: (value: T) => void, destroyRef?: DestroyRef): void {
    const subscription = source$.subscribe(callback);
    this.subscriptions.push(subscription);
    destroyRef?.onDestroy(() => {
      subscription.unsubscribe();
      const index = this.subscriptions.indexOf(subscription);
      if (index >= 0) {
        this.subscriptions.splice(index, 1);
      }
    });
  }

  enableChange(callback: (enabled: boolean) => void, destroyRef?: DestroyRef): TChild {
    this.watch(
      this.fgControl.meta$.pipe(
        map(e => e.enabled),
        distinctUntilChanged(),
      ),
      callback,
      destroyRef,
    );
    return this.fgControl as unknown as TChild;
  }

  metaChange(callback: (meta: Meta) => void, destroyRef?: DestroyRef): TChild {
    this.watch(this.fgControl.meta$, callback, destroyRef);
    return this.fgControl as unknown as TChild;
  }
  alwaysDisabled(): TChild {
    // enable() leaves the control disabled, so a parent's enable() never enables it or its element. Disabling it again
    // inside enable()'s own event was not enough: Angular then enabled the element after it, with setDisabledState(false).
    const { control } = this.fgControl as ACImpl<unknown>;
    control.enable = () => {
      // stays disabled
    };
    this.fgControl.metaFn.disable();
    // A group or an array is also enabled when one of its children is
    this.watch(this.fgControl.meta$, meta => {
      if (meta.enabled) {
        this.fgControl.metaFn.disable();
      }
    });
    return this.fgControl as unknown as TChild;
  }
}
