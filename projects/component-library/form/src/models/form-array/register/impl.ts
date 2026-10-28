import type { DeepPartial } from 'tableau-ui-angular/types';
import { alsoOnEnabledChange, RegisterFnsImpl } from '../../abstract-control/register/impl';
import type { FG } from '../../form-group/interfaces';
import type { FA } from '../interaces';
import type { FaRegisterFns } from './interfaces';
import type { DestroyRef } from '@angular/core';
import type { Subscription } from 'rxjs';
import { pairwise, startWith } from 'rxjs';

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
   * @param destroyRef When given, the callback is released when it is destroyed, such as a component's; otherwise it
   * lives until the form's `destroy()`.
   */
  valueChange(
    callback: (value: DeepPartial<TItem>[], oldValue: DeepPartial<TItem>[] | undefined, controls: FG<TItem>[], control: FA<TItem>) => void,
    alsoRunOnEnabled: boolean = false,
    alsoRunOnDisabled: boolean = false,
    destroyRef?: DestroyRef,
  ): FA<TItem> {
    const changes$ = this.fa.value$.pipe(startWith(undefined), pairwise());
    this.watch(
      alsoOnEnabledChange(changes$, this.fa.meta$, alsoRunOnEnabled, alsoRunOnDisabled),
      ([oldValue, value]) => {
        callback(value!, oldValue, this.fa.$controls(), this.fa);
      },
      destroyRef,
    );
    return this.fa;
  }
}
