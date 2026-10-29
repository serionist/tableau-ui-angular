import type { DestroyRef } from '@angular/core';
import type { Subscription } from 'rxjs';
import { startWith, pairwise } from 'rxjs';
import { alsoOnEnabledChange, RegisterFnsImpl } from '../../abstract-control/register/impl';
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
  valueChange(callback: (value: T, oldValue: T | undefined, control: FC<T>) => void, alsoRunOnEnabled: boolean = false, alsoRunOnDisabled: boolean = false, destroyRef?: DestroyRef): FC<T> {
    const changes$ = this.fcControl.value$.pipe(startWith(undefined), pairwise());
    this.watch(
      alsoOnEnabledChange(changes$, this.fcControl.meta$, alsoRunOnEnabled, alsoRunOnDisabled),
      ([oldValue, value]) => {
        callback(value as T, oldValue, this.fcControl);
      },
      destroyRef,
    );
    return this.fcControl;
  }
}
