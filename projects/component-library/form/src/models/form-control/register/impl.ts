import type { Observable, Subscription } from 'rxjs';
import { startWith, pairwise, map, filter, combineLatest } from 'rxjs';
import { RegisterFnsImpl } from '../../abstract-control/register/impl';
import type { FC } from '../interfaces';
import type { FcRegisterFns } from './interfaces';
import type { FCImpl } from '../impl';
import type { PrimitiveWithUndefined } from '../types';

export class FcRegisterFnsImpl<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]> extends RegisterFnsImpl<FC<T>> implements FcRegisterFns<T> {
  constructor(
    private readonly fcControl: FCImpl<T>,
    subscriptions: Subscription[] = [],
  ) {
    super(fcControl, subscriptions);
  }
  valueChange(callback: (value: T, oldValue: T | undefined, control: FC<T>) => void, alsoRunOnEnabled: boolean = false, alsoRunOnDisabled: boolean = false): FC<T> {
    const subs: [Observable<[T | undefined, T]>, Observable<boolean>?] = [
      this.fcControl.value$.pipe(
        startWith(undefined as unknown as T),
        pairwise(),
        map(v => [v[0] as T | undefined, v[1] ?? v[0]]),
      ),
    ];
    if (alsoRunOnEnabled || alsoRunOnDisabled) {
      subs.push(
        this.fcControl.meta$.pipe(
          map(e => e.enabled),
          filter(enabled => {
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
        callback(v[1], v[0], this.fcControl);
      }),
    );
    return this.fcControl;
  }
}
