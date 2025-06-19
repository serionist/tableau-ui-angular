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

    static fromControl(control: ACImpl<unknown>): Meta {
        const c = control.control;
        // valueIsDefault is true if:
        // - the control is a FC<any> and the value is equal to the default value
        // - the control is an FG<any> and the value
        return new MetaImpl(
            c.untouched,
            c.touched,
            c.status,
            c.pristine,
            c.dirty,
            c.enabled,
            c.disabled,
            this.isValueDefault(control),
            c.updateOn,
            c.errors,
            control.hierarchy.childList$.value.map((ca) => MetaImpl.fromControl(ca as ACImpl<unknown>)),
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
            return meta.childControls.some((c) => this._hasError(c, errorCode, requireTouched));
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
                if (value !== undefined) {
                    return value;
                }
            }
        }
        return null;
    }

    public static compare(a: Meta, b: Meta): boolean {
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

    private static isValueDefault(control: AC) {
        // valueIsDefault is true if:
        // - the control is a FC<any> and the value is equal to the default value. If value is an array, it checks if all items are in the default value array
        if (control instanceof FCImpl) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const val = control.control.value;
            if (Array.isArray(val) && Array.isArray(control.defaultValue)) {
                if (val.length !== control.defaultValue.length) {
                    return false;
                }
                for (const valItem of val) {
                    if (!control.defaultValue.includes(valItem)) {
                        return false;
                    }
                }
                return true;
            } else {
                return val === control.defaultValue;
            }
        } else {
            // if the control is a non-FC control, we check if all child controls have their value equal to the default value
            for (const child of control.hierarchy.$childList()) {
                if (!this.isValueDefault(child)) {
                    return false;
                }
            }
            return true;
        }
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
     * @param emitEvent When true, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, marks all ancestors of the control as well
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
     * If the control has any children, also marks all children as `untouched`
     * and recalculates the `touched` status of all parent controls.
     *
     * @see {@link markAsTouched()}
     * @see {@link markAsDirty()}
     * @see {@link markAsPristine()}
     *
     * @param emitEvent When true, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
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
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
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
     * If the control has any children, marks all children as `pristine`,
     * and recalculates the `pristine` status of all parent
     * controls.
     *
     * If the control is already pristine, this does nothing
     *
     * @see {@link markAsTouched()}
     * @see {@link markAsUntouched()}
     * @see {@link markAsDirty()}
     *
     * @param emitEvent When true, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
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
     * If the control has children, all children are also disabled.
     *
     * If the control is already disabled, this does nothing.
     *
     * @see {@link AbstractControlMeta.validity}
     *
     * @param emitEvent When true, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     */
    disable(emitEvent = true, markAncestors = false): TChild {
        if (!this.control.enabled) {
            return this.ctrl as unknown as TChild;
        }
        this.control.disable({
            onlySelf: !markAncestors,
            emitEvent: emitEvent,
        });
        this.control.disable({ onlySelf: !markAncestors });
        return this.ctrl as unknown as TChild;
    }
    /**
     * Enables the control. This means the control is included in validation checks and
     * the aggregate value of its parent. Its status recalculates based on its value and
     * its validators.
     *
     * By default, if the control has children, all children are enabled.
     *
     * If the control is already enabled, this does nothing.
     *
     * @see {@link AbstractControl.status}
     *
     * @param emitEvent When true, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     */
    enable(emitEvent = true, markAncestors = false): TChild {
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
