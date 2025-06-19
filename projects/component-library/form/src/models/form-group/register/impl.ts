import type { Observable, Subscription } from 'rxjs';
import { combineLatest, filter, map, pairwise, startWith } from 'rxjs';
import { RegisterFnsImpl } from '../../abstract-control/register/impl';
import type { FC } from '../../form-control/interfaces';

import type { FG } from '../interfaces';
import type { FgRegisterFns } from './interfaces';
import type { FGImpl } from '../impl';
import type { DeepPartial, Primitive } from 'tableau-ui-angular/types';
import type { FormReferencesOf } from '../../../types/form-references-of';

export class FgRegisterFnsImpl<TSource extends Record<string, unknown>> extends RegisterFnsImpl<FG<TSource>> implements FgRegisterFns<TSource> {
  constructor(
    private readonly fg: FGImpl<TSource>,
    subscriptions: Subscription[] = [],
  ) {
    super(fg, subscriptions);
  }

  valueChange(
    callback: (value: DeepPartial<TSource>, oldValue: DeepPartial<TSource> | undefined, control: FG<TSource>) => void,
    alsoRunOnEnabled: boolean = false,
    alsoRunOnDisabled: boolean = false,
  ): FG<TSource> {
    const subs: [Observable<[DeepPartial<TSource> | undefined, DeepPartial<TSource>]>, Observable<boolean>?] = [
      this.fg.value$.pipe(
        startWith(undefined as unknown as DeepPartial<TSource>),
        pairwise(),
        map(v => [v[0] as DeepPartial<TSource> | undefined, v[1] ?? v[0]]),
      ),
    ];
    if (alsoRunOnEnabled || alsoRunOnDisabled) {
      subs.push(
        this.fg.meta$.pipe(
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
        callback(v[1], v[0], this.fg);
      }),
    );
    return this.fg;
  }
  childChange<T extends Primitive | Primitive[]>(
    formControlSelector: (children: FormReferencesOf<TSource>) => FC<T>,
    callback: (group: FG<TSource>, control: FC<T>, value: T) => void,
    alsoRunOnEnabled: boolean = false,
    alsoRunOnDisabled: boolean = false,
  ): FG<TSource> {
    const ctrl = formControlSelector(this.fg.controls);

    const subs: [Observable<T>, Observable<boolean>?] = [
      ctrl.value$.pipe(
        map(v => {
          return v;
        }),
      ),
    ];
    if (alsoRunOnEnabled || alsoRunOnDisabled) {
      subs.push(
        this.fg.meta$.pipe(
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
        callback(this.fg, ctrl, v);
      }),
    );
    return this.fg;
  }

  childGroupChange<T extends Record<string, unknown>>(
    formControlSelector: (children: FormReferencesOf<TSource>) => FG<T>,
    callback: (group: FG<TSource>, control: FG<T>, value: DeepPartial<T>) => void,
    alsoRunOnEnabled: boolean = false,
    alsoRunOnDisabled: boolean = false,
  ): FG<TSource> {
    const ctrl = formControlSelector(this.fg.controls);
    const subs: [Observable<DeepPartial<T>>, Observable<boolean>?] = [ctrl.value$];
    if (alsoRunOnEnabled || alsoRunOnDisabled) {
      subs.push(
        this.fg.meta$.pipe(
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
        callback(this.fg, ctrl, v);
      }),
    );
    return this.fg;
  }
}
