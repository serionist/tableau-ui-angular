import type { DestroyRef } from '@angular/core';
import type { DeepPartial } from 'tableau-ui-angular/types';
import type { RegisterFns } from '../../abstract-control/register/interfaces';
import type { FG } from '../../form-group/interfaces';
import type { FA } from '../interaces';

export interface FaRegisterFns<TItem extends Record<string, unknown>> extends RegisterFns<FA<TItem>> {
  /**
   * Registers a callback to be called when the value of the array changes.
   * The callback is always called initially.
   * @param callback
   * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
   * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
   * @param destroyRef When given, the callback is released when it is destroyed, such as a component's; otherwise it
   * lives until the form's `destroy()`.
   */
  valueChange: (
    callback: (value: DeepPartial<TItem>[], oldValue: DeepPartial<TItem>[] | undefined, controls: FG<TItem>[], control: FA<TItem>) => void,
    alsoRunOnEnabled?: boolean,
    alsoRunOnDisabled?: boolean,
    destroyRef?: DestroyRef,
  ) => FA<TItem>;
}
