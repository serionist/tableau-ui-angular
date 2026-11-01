import type { FormControlStatus, ValidationErrors } from '@angular/forms';
import type { AC } from '../interfaces';
import type { Primitive } from 'tableau-ui-angular/types';

/**
 * A control's state, as of its last event. A group's or an array's `childControls`, and its `valueIsDefault`, are its
 * children's metas as of their last events, so a refresh costs only the direct children. A write with
 * `emitEvent: false` shows in the metas at that control's next event: `name.setValue('Ada', { emitEvent: false })`
 * leaves the group's `valueIsDefault` as it was until `name` emits again.
 */
export interface Meta {
  readonly untouched: boolean;
  readonly touched: boolean;
  readonly validity: FormControlStatus;
  readonly pristine: boolean;
  readonly dirty: boolean;
  readonly enabled: boolean;
  readonly disabled: boolean;
  /** Whether the value equals the default; for a group or an array, whether every child's does */
  readonly valueIsDefault: boolean;
  readonly updateOn: 'blur' | 'change' | 'submit';
  readonly errors: ValidationErrors | null;
  /** The children's metas, as of their last events */
  readonly childControls: readonly Meta[] | undefined;

  hasError: (errorCode?: string, requireTouched?: boolean) => boolean;
  getErrorValue: (errorCode: string, requireTouched?: boolean) => Primitive;
}

export interface MetaFns<TChild = AC> {
  /**
   * Sets errors on a form control when running validations manually, rather than automatically.
   *
   * Calling `setErrors` also updates the validity of the parent control.
   *
   * @param opts Configuration options that determine how the control propagates
   * changes and emits events after the control errors are set.
   * * `emitEvent`: When true or not supplied (the default), the `statusChanges`
   * observable emits an event after the errors are set.
   *
   * @usageNotes
   *
   * ### Manually set the errors for a control
   *
   * ```ts
   * const login = new FormControl('someLogin');
   * login.setErrors({
   *   notUnique: true
   * });
   *
   * expect(login.valid).toEqual(false);
   * expect(login.errors).toEqual({ notUnique: true });
   *
   * login.setValue('someOtherLogin');
   *
   * expect(login.valid).toEqual(true);
   * ```
   */
  setErrors: (errors: ValidationErrors | null, emitEvent?: boolean) => TChild;

  /**
   * Marks the control as `touched`. A control is touched by focus and
   * blur events that do not change the value.
   *
   *
   * @see {@link markAsUntouched()}
   * @see {@link markAsDirty()}
   * @see {@link markAsPristine()}
   *
   * @param markAncestors When true, marks the control's ancestors touched as well. When false or not supplied, marks
   * only this control. Default is false. It comes first here, and second in the other methods.
   * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
   */
  markAsTouched: (markAncestors?: boolean, emitEvent?: boolean) => TChild;
  /**
   * Marks the control and all its descendant controls as `touched`.
   * @see {@link markAsTouched()}
   *
   * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
   */
  markAllAsTouched: (emitEvent?: boolean) => TChild;
  /**
   * Marks the control as `untouched`.
   *
   * If the control has any children, also marks all children as `untouched`.
   *
   * @see {@link markAsTouched()}
   * @see {@link markAsDirty()}
   * @see {@link markAsPristine()}
   *
   * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
   * @param markAncestors When true, also recalculates the `touched` status of the control's ancestors. When false or
   * not supplied, marks only this control and its children. Default is false.
   */
  markAsUntouched: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
  /**
   * Marks the control as `dirty`. A control becomes dirty when
   * the control's value is changed through the UI; compare `markAsTouched`.
   *
   * If the control is already dirty this does nothing
   *
   * @see {@link markAsTouched()}
   * @see {@link markAsUntouched()}
   * @see {@link markAsPristine()}
   *
   * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
   * @param markAncestors When true, marks the control's ancestors dirty as well. When false or not supplied, marks only
   * this control. Default is false.
   */
  markAsDirty: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
  /**
   * Marks the control as `pristine`.
   *
   * If the control has any children, marks all children as `pristine`.
   *
   * If the control is already pristine, this does nothing
   *
   * @see {@link markAsTouched()}
   * @see {@link markAsUntouched()}
   * @see {@link markAsDirty()}
   *
   * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
   * @param markAncestors When true, also recalculates the `pristine` status of the control's ancestors. When false or
   * not supplied, marks only this control and its children. Default is false.
   */
  markAsPristine: (emitEvent?: boolean, markAncestors?: boolean) => TChild;

  /**
   * Disables the control. This means the control is exempt from validation checks and
   * excluded from the aggregate value of any parent. Its validity is `DISABLED`.
   *
   * If the control has children, all children are also disabled. Its ancestors then update their value and validity,
   * as Angular's own `disable()` does, so a group's value and validity leave the control out.
   *
   * If the control is already disabled, this does nothing.
   *
   * @see {@link AbstractControlMeta.validity}
   *
   * @param emitEvent When true or not supplied, the control and its ancestors emit their value and status changes.
   * When false, none of them does, and the control's meta, its errors with it, waits for its next event: until then
   * a disabled field keeps the errors it had, such as `required`, and its ancestors' `hasError()` can still find them
   * through `childControls`. The ancestors' `value$` waits for their next value change. Default is true.
   * @param markAncestors When true or not supplied, the ancestors update as with Angular's `onlySelf: false`: each
   * recalculates its value and validity, runs its async validators, emits its value and status changes unless
   * `emitEvent` is false, and takes `pristine` and `touched` from its enabled children, so disabling the only
   * dirty field makes the form pristine. When false, as with `onlySelf: true`, only this control and its
   * children change, and the ancestors keep all of it until their next update. Default is true.
   */
  disable: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
  /**
   * Enables the control. This means the control is included in validation checks and
   * the aggregate value of its parent. Its status recalculates based on its value and
   * its validators.
   *
   * By default, if the control has children, all children are enabled. Its ancestors then update their value and
   * validity, as Angular's own `enable()` does, so a group's value and validity take the control in again.
   *
   * If the control is already enabled, this does nothing.
   *
   * @see {@link AbstractControl.status}
   *
   * @param emitEvent When true or not supplied, the control and its ancestors emit their value and status changes.
   * When false, none of them does, and the control's meta, its errors with it, waits for its next event: until then
   * an enabled field shows none of the errors it now has. The ancestors' `value$` waits for their next value change.
   * Default is true.
   * @param markAncestors When true or not supplied, the ancestors update as with Angular's `onlySelf: false`: each
   * recalculates its value and validity, runs its async validators, emits its value and status changes unless
   * `emitEvent` is false, and takes `pristine` and `touched` from its enabled children, so enabling a dirty field
   * makes the form dirty. When false, as with `onlySelf: true`, only this control and its
   * children change, and the ancestors keep all of it until their next update. Default is true.
   */
  enable: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
}
