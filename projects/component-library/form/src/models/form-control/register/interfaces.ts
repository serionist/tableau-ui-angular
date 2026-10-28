import type { DestroyRef } from '@angular/core';
import type { RegisterFns } from '../../abstract-control/register/interfaces';
import type { FC } from '../interfaces';
import type { PrimitiveWithUndefined } from '../types';

export interface FcRegisterFns<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]> extends RegisterFns<FC<T>> {
  /**
   * Registers a callback to be called when the value of the control changes.
   * The callback is always called initially.
   * @param callback
   * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
   * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
   * @param destroyRef When given, the callback is released when it is destroyed, such as a component's; otherwise it
   * lives until the form's `destroy()`.
   */
  valueChange: (callback: (value: T, oldValue: T | undefined, control: FC<T>) => void, alsoRunOnEnabled?: boolean, alsoRunOnDisabled?: boolean, destroyRef?: DestroyRef) => FC<T>;
}
