import type { FormControlStatus, ValidationErrors } from "@angular/forms";
import type { Primitive } from "../../../../common/types/primitive";
import type { AC } from "../interfaces";

export interface Meta {

    readonly untouched: boolean;
    readonly touched: boolean;
    readonly validity: FormControlStatus;
    readonly pristine: boolean;
    readonly dirty: boolean;
    readonly enabled: boolean;
    readonly disabled: boolean;
    readonly updateOn: 'blur' | 'change' | 'submit';
    readonly errors: ValidationErrors | null;
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
     * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, marks all ancestors of the control as well
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
     * If the control has any children, also marks all children as `untouched`
     * and recalculates the `touched` status of all parent controls.
     *
     * @see {@link markAsTouched()}
     * @see {@link markAsDirty()}
     * @see {@link markAsPristine()}
     *
     * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
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
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     */
    markAsDirty: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
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
     * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     */
    markAsPristine: (emitEvent?: boolean, markAncestors?: boolean) => TChild;

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
     * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     */
    disable: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
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
     * @param emitEvent When true or not supplied, the meta$ observable emits an event. Default is true.
     * @param markAncestors When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     */
    enable: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
}