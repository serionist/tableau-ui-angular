import type { DestroyRef } from '@angular/core';
import type { Subscription } from 'rxjs';
import { pairwise, startWith } from 'rxjs';
import { alsoOnEnabledChange, RegisterFnsImpl } from '../../abstract-control/register/impl';
import type { FC } from '../../form-control/interfaces';
import type { PrimitiveWithUndefined } from '../../form-control/types';

import type { FG } from '../interfaces';
import type { FgRegisterFns } from './interfaces';
import type { FGImpl } from '../impl';
import type { DeepPartial } from 'tableau-ui-angular/types';
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
    destroyRef?: DestroyRef,
  ): FG<TSource> {
    const changes$ = this.fg.value$.pipe(startWith(undefined), pairwise());
    this.watch(
      alsoOnEnabledChange(changes$, this.fg.meta$, alsoRunOnEnabled, alsoRunOnDisabled),
      ([oldValue, value]) => {
        callback(value!, oldValue, this.fg);
      },
      destroyRef,
    );
    return this.fg;
  }
  childChange<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]>(
    formControlSelector: (children: FormReferencesOf<TSource>) => FC<T>,
    callback: (group: FG<TSource>, control: FC<T>, value: T) => void,
    alsoRunOnEnabled: boolean = false,
    alsoRunOnDisabled: boolean = false,
    destroyRef?: DestroyRef,
  ): FG<TSource> {
    const ctrl = formControlSelector(this.fg.controls);
    this.watch(
      alsoOnEnabledChange(ctrl.value$, this.fg.meta$, alsoRunOnEnabled, alsoRunOnDisabled),
      value => {
        callback(this.fg, ctrl, value);
      },
      destroyRef,
    );
    return this.fg;
  }

  childGroupChange<T extends Record<string, unknown>>(
    formControlSelector: (children: FormReferencesOf<TSource>) => FG<T>,
    callback: (group: FG<TSource>, control: FG<T>, value: DeepPartial<T>) => void,
    alsoRunOnEnabled: boolean = false,
    alsoRunOnDisabled: boolean = false,
    destroyRef?: DestroyRef,
  ): FG<TSource> {
    const ctrl = formControlSelector(this.fg.controls);
    this.watch(
      alsoOnEnabledChange(ctrl.value$, this.fg.meta$, alsoRunOnEnabled, alsoRunOnDisabled),
      value => {
        callback(this.fg, ctrl, value);
      },
      destroyRef,
    );
    return this.fg;
  }
}
