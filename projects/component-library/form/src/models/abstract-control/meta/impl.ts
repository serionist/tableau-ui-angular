import type { AbstractControl, FormControlStatus } from '@angular/forms';
import type { Meta, MetaFns } from './interfaces';
import type { AC } from '../interfaces';
import type { ValidationErrors } from '../validation/interfaces';
import type { ACImpl } from '../impl';
import type { Primitive } from 'tableau-ui-angular/types';
import { FCImpl } from '../../form-control/impl';

export class MetaImpl implements Meta {
  private constructor(
    public readonly untouched: boolean,
    public readonly touched: boolean,
    public readonly validity: FormControlStatus,
    public readonly pristine: boolean,
    public readonly dirty: boolean,
    public readonly enabled: boolean,
    public readonly disabled: boolean,
    public readonly valueIsDefault: boolean,
    public readonly updateOn: 'blur' | 'change' | 'submit',
    public readonly errors: ValidationErrors | null,
    public readonly childControls: readonly Meta[] | undefined,
  ) {}

  /**
   * The control's meta: its own flags from the Angular control, and its children's part, `childControls` and a group's
   * or an array's `valueIsDefault`, from each child's current meta. It costs the direct children only.
   */
  static fromControl(control: ACImpl<unknown>): Meta {
    const c = control.control;
    const children = control.hierarchy.childList$.value.map(child => child.meta$.value);
    return new MetaImpl(
      c.untouched,
      c.touched,
      c.status,
      c.pristine,
      c.dirty,
      c.enabled,
      c.disabled,
      control instanceof FCImpl ? this.isValueDefault(c.value, control.defaultValue) : children.every(child => child.valueIsDefault),
      c.updateOn,
      c.errors,
      children,
    );
  }

  /**
   * `meta` with its children's part rebuilt from their current metas, and its own flags kept. A child's change refreshes
   * a group or an array this way: Angular emits the parent's own event once it is done with the children, and only then
   * do its own flags, such as `enabled`, change.
   */
  static withChildren(meta: Meta, control: ACImpl<unknown>): Meta {
    const children = control.hierarchy.childList$.value.map(child => child.meta$.value);
    return new MetaImpl(
      meta.untouched,
      meta.touched,
      meta.validity,
      meta.pristine,
      meta.dirty,
      meta.enabled,
      meta.disabled,
      children.every(child => child.valueIsDefault),
      meta.updateOn,
      meta.errors,
      children,
    );
  }

  hasError(errorCode?: string, requireTouched = true): boolean {
    return MetaImpl._hasError(this, errorCode, requireTouched);
  }
  getErrorValue(errorCode: string, requireTouched = true): Primitive {
    return MetaImpl._getErrorValue(this, errorCode, requireTouched);
  }

  private static _hasError(meta?: MetaImpl, errorCode?: string, requireTouched = true): boolean {
    if (!meta) {
      return false;
    }
    if ((!requireTouched || meta.touched) && meta.validity === 'INVALID' && meta.errors && (errorCode === undefined ? Object.keys(meta.errors).length > 0 : errorCode in meta.errors)) {
      return true;
    }
    if (meta.childControls) {
      return meta.childControls.some(c => this._hasError(c, errorCode, requireTouched));
    }
    return false;
  }
  private static _getErrorValue(meta: MetaImpl, errorCode: string, requireTouched = true): Primitive {
    if (meta === undefined) {
      return null;
    }
    if ((!requireTouched || meta.touched) && meta.validity === 'INVALID' && meta.errors && errorCode in meta.errors) {
      return meta.errors[errorCode];
    }
    if (meta.childControls) {
      for (const c of meta.childControls) {
        const value = this._getErrorValue(c, errorCode, requireTouched);
        // a child without the error gives null, and the next one may have it
        if (value !== null) {
          return value;
        }
      }
    }
    return null;
  }

  public static compare(a: Meta, b: Meta): boolean {
    // a child's meta that didn't change is the same object, so comparing a parent stops there
    if (a === b) {
      return true;
    }
    const baseEqual =
      a.untouched === b.untouched &&
      a.touched === b.touched &&
      a.validity === b.validity &&
      a.pristine === b.pristine &&
      a.dirty === b.dirty &&
      a.enabled === b.enabled &&
      a.disabled === b.disabled &&
      a.valueIsDefault === b.valueIsDefault &&
      a.updateOn === b.updateOn &&
      this.validationErrorsEqual(a.errors, b.errors);
    if (!baseEqual) {
      return false;
    }
    if (!a.childControls && !b.childControls) {
      return true;
    }
    if (!a.childControls || !b.childControls) {
      return false;
    }
    if (a.childControls.length !== b.childControls.length) {
      return false;
    }
    for (let i = 0; i < a.childControls.length; i++) {
      if (!this.compare(a.childControls[i], b.childControls[i])) {
        return false;
      }
    }
    return true;
  }
  private static validationErrorsEqual(a: ValidationErrors | null, b: ValidationErrors | null): boolean {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!(key in b)) {
        return false;
      }
      if (typeof a[key] !== typeof b[key]) {
        return false;
      }

      if (a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  }

  /** Whether a control's value equals its default; an array value counts when it holds the same items */
  private static isValueDefault(value: unknown, defaultValue: unknown): boolean {
    if (Array.isArray(value) && Array.isArray(defaultValue)) {
      return value.length === defaultValue.length && value.every(item => defaultValue.includes(item));
    }
    return value === defaultValue;
  }
}

export class MetaFnsImpl<TChild> implements MetaFns<TChild> {
  constructor(
    private readonly control: AbstractControl,
    private readonly ctrl: AC,
  ) {}
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
  public setErrors(errors: ValidationErrors | null, emitEvent = true): TChild {
    this.control.setErrors(errors, { emitEvent });
    return this.ctrl as unknown as TChild;
  }

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
   * @param emitEvent When true, the meta$ observable emits an event. Default is true.
   */
  markAsTouched(markAncestors = false, emitEvent = true): TChild {
    if (!markAncestors && this.control.touched) {
      return this.ctrl as unknown as TChild;
    }
    this.control.markAsTouched({
      onlySelf: !markAncestors,
      emitEvent: emitEvent,
    });
    return this.ctrl as unknown as TChild;
  }
  /**
   * Marks the control and all its descendant controls as `touched`.
   * @see {@link markAsTouched()}
   *
   * @param emitEvent When true, the meta$ observable emits an event. Default is true.
   */
  markAllAsTouched(emitEvent = true): TChild {
    this.control.markAllAsTouched({
      emitEvent: emitEvent,
    });
    return this.ctrl as unknown as TChild;
  }
  /**
   * Marks the control as `untouched`.
   *
   * If the control has any children, also marks all children as `untouched`.
   *
   * @see {@link markAsTouched()}
   * @see {@link markAsDirty()}
   * @see {@link markAsPristine()}
   *
   * @param emitEvent When true, the meta$ observable emits an event. Default is true.
   * @param markAncestors When true, also recalculates the `touched` status of the control's ancestors. When false or
   * not supplied, marks only this control and its children. Default is false.
   */
  markAsUntouched(emitEvent = true, markAncestors = false): TChild {
    this.control.markAsUntouched({
      onlySelf: !markAncestors,
      emitEvent: emitEvent,
    });
    return this.ctrl as unknown as TChild;
  }
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
   * @param emitEvent When true, the meta$ observable emits an event. Default is true.
   * @param markAncestors When true, marks the control's ancestors dirty as well. When false or not supplied, marks only
   * this control. Default is false.
   */
  markAsDirty(emitEvent = true, markAncestors = false): TChild {
    if (this.ctrl.meta$.value.dirty) {
      return this.ctrl as unknown as TChild;
    }
    this.control.markAsDirty({
      onlySelf: !markAncestors,
      emitEvent: emitEvent,
    });
    return this.ctrl as unknown as TChild;
  }
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
   * @param emitEvent When true, the meta$ observable emits an event. Default is true.
   * @param markAncestors When true, also recalculates the `pristine` status of the control's ancestors. When false or
   * not supplied, marks only this control and its children. Default is false.
   */
  markAsPristine(emitEvent = true, markAncestors = false): TChild {
    if (this.ctrl.meta$.value.pristine) {
      return this.ctrl as unknown as TChild;
    }
    this.control.markAsPristine({
      onlySelf: !markAncestors,
      emitEvent: emitEvent,
    });
    return this.ctrl as unknown as TChild;
  }

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
   * When false, none of them does: the control's meta and the ancestors' `value$` show the change at their next
   * event. Default is true.
   * @param markAncestors When true or not supplied, the ancestors update their value and validity. When false, only
   * this control and its children change, as with Angular's `onlySelf: true`, and the ancestors keep theirs until
   * their next update. Default is true.
   */
  disable(emitEvent = true, markAncestors = true): TChild {
    if (!this.control.enabled) {
      return this.ctrl as unknown as TChild;
    }
    this.control.disable({
      onlySelf: !markAncestors,
      emitEvent: emitEvent,
    });
    return this.ctrl as unknown as TChild;
  }
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
   * When false, none of them does: the control's meta and the ancestors' `value$` show the change at their next
   * event. Default is true.
   * @param markAncestors When true or not supplied, the ancestors update their value and validity. When false, only
   * this control and its children change, as with Angular's `onlySelf: true`, and the ancestors keep theirs until
   * their next update. Default is true.
   */
  enable(emitEvent = true, markAncestors = true): TChild {
    if (this.control.enabled) {
      return this.ctrl as unknown as TChild;
    }
    this.control.enable({
      onlySelf: !markAncestors,
      emitEvent: emitEvent,
    });
    return this.ctrl as unknown as TChild;
  }
}
