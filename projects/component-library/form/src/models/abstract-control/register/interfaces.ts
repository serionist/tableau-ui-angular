import type { DestroyRef } from '@angular/core';
import type { AC } from '../interfaces';
import type { Meta } from '../meta/interfaces';

export interface RegisterFns<TChild = AC> {
  /**
   * Registers a callback to be called when the control is enabled or disabled, and once at first.
   * @param destroyRef When given, the callback is released when it is destroyed, such as a component's; otherwise it
   * lives until the form's `destroy()`.
   */
  enableChange: (callback: (enabled: boolean) => void, destroyRef?: DestroyRef) => TChild;

  /**
   * Registers a callback to be called when the control's meta changes, and once at first.
   * @param destroyRef When given, the callback is released when it is destroyed, such as a component's; otherwise it
   * lives until the form's `destroy()`.
   */
  metaChange: (callback: (meta: Meta) => void, destroyRef?: DestroyRef) => TChild;
  /**
   * Disables the control for good: `enable()`, its own or a parent's, leaves it and its element disabled.
   */
  alwaysDisabled: () => TChild;
}
