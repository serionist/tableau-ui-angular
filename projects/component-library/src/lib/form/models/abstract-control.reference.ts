import {
    AbstractControl,
    AsyncValidatorFn,
    ControlEvent,
    FormArray,
    FormControl,
    FormControlStatus,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import { generateRandomString } from '../../utils';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    map,
    Observable,
    of,
    startWith,
    Subject,
    Subscription,
    switchMap,
} from 'rxjs';
import { FA } from './form-array.reference';
import { FG } from './form-group.reference';
import { ReadonlyBehaviorSubject } from '../types/readonly-behaviorsubject';
import { Signal, signal, WritableSignal } from '@angular/core';
import { FC } from './form-control.reference';

export abstract class AC<TValue = any> {
    readonly id: string = generateRandomString();
    readonly type: 'control' | 'group' | 'array';
    /** @internal */
    readonly __private_control: AbstractControl;
    readonly childList: AC[];

    protected _parent: AC | undefined;
    /**
     *  The parent of this control
     */
    get parent(): AC | undefined {
        return this._parent;
    }
    /**
     * The root of this control. This is the top level control in the tree.
     */
    get root(): AC | undefined {
        let parent = this.parent;
        while (parent) {
            if (parent.parent) {
                parent = parent.parent;
            } else {
                return parent;
            }
        }
        return undefined;
    }
    protected subscriptions: Subscription[] = [];

    protected abstract readonly _value$: BehaviorSubject<TValue>;
    protected abstract readonly _value: WritableSignal<TValue>;
    get value$(): ReadonlyBehaviorSubject<TValue> {
        return this._value$;
    }
    get value(): Signal<TValue> {
        return this._value;
    }
    private readonly _meta$: BehaviorSubject<AbstractControlMeta>;
    private readonly _metaSignal: WritableSignal<AbstractControlMeta>;
    get meta$(): ReadonlyBehaviorSubject<AbstractControlMeta> {
        return this._meta$;
    }
    get meta(): Signal<AbstractControlMeta> {
        return this._metaSignal;
    }
    private readonly _enabled$: BehaviorSubject<boolean>;
    private readonly _enabledSignal: WritableSignal<boolean>;
    get enabled$(): ReadonlyBehaviorSubject<boolean> {
        return this._enabled$;
    }
    get enabled(): Signal<boolean> {
        return this._enabledSignal;
    }

    constructor(
        type: 'control' | 'group' | 'array',
        control: AbstractControl,
        childList: AC[] = []
    ) {
        this.__private_control = control;
        this.childList = childList.map((c) => {
            c._parent = this;
            return c;
        });
        this.type = type;
        this._validators = new ValidatorOperations(this.__private_control);
        const initialMeta = AbstractControlMeta.fromControl(this);
        this._meta$ = new BehaviorSubject<AbstractControlMeta>(initialMeta);
        this._metaSignal = signal<AbstractControlMeta>(initialMeta);
        this.subscriptions.push(
            this.__private_control.events
                .pipe(
                    map(() => AbstractControlMeta.fromControl(this)),
                    distinctUntilChanged((a, b) =>
                        AbstractControlMeta.compare(a, b)
                    )
                )
                .subscribe((meta) => {
                    this._meta$.next(meta);
                    this._metaSignal.set(meta);
                })
        );
        this._enabled$ = new BehaviorSubject<boolean>(
            this.__private_control.enabled
        );
        this._enabledSignal = signal<boolean>(this.__private_control.enabled);
        this.subscriptions.push(
            this.meta$
                .pipe(
                    map((meta) => meta.validity !== 'DISABLED'),
                    distinctUntilChanged()
                )
                .subscribe((enabled) => {
                    this._enabled$.next(enabled);
                })
        );
        this.subscriptions.push(
            this._enabled$.subscribe((enabled) => {
                this._enabledSignal.set(enabled);
            })
        );
    }
    public getRawValue(): TValue {
        return this.__private_control.getRawValue() as TValue;
    }
    /**
     * Sets a new value for the form control.
     *
     * @param value The new value for the control.
     * @param options Configuration options that determine how the control propagates changes
     * and emits events when the value changes.
     * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
     * updateValueAndValidity} method.
     *
     * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
     * false.
     * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
     * `valueChanges`
     * observables emit events with the latest status and value when the control value is updated.
     * When false, no events are emitted.
     * * `emitModelToViewChange`: Only for FormControls. When true or not supplied  (the default), each change triggers an
     * `onChange` event to
     * update the view.
     * * `emitViewToModelChange`: Only for FormControls. When true or not supplied (the default), each change triggers an
     * `ngModelChange`
     * event to update the model.
     *
     */
    public setValue(
        value: TValue,
        options?: {
            onlySelf?: boolean;
            emitEvent?: boolean;
            emitModelToViewChange?: boolean;
            emitViewToModelChange?: boolean;
        }
    ) {
        this.__private_control.setValue(value, options);
    }
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
    public setErrors(errors: ValidationErrors | null, emitEvent = true) {
        this.__private_control.setErrors(errors, { emitEvent });
    }

    public updateAllValidation(markAsTouched = true) {
        AC._updateAllValidation(this, markAsTouched);
    }
    private static _updateAllValidation(f: AC, markAsTouched = true) {
        for (const child of f.childList) {
            this._updateAllValidation(child, markAsTouched);
        }

        if (markAsTouched) {
            f.__private_control.markAsTouched({ onlySelf: true });
        }
        f.__private_control.updateValueAndValidity({ onlySelf: true });
    }

    public getChild(path?: string | string[]): Observable<AC | null> {
        if (!path) {
            return AC._getChild(this, []);
        }
        if (typeof path === 'string') {
            path = path.split('.').filter((p) => p !== '');
        }
        return AC._getChild(this, path).pipe(
            map((e) => {
                if (e === undefined) {
                    return null;
                }
                return e;
            })
        );
    }
    private static _getChild(form: AC, parts: string[]): Observable<AC | null> {
        const key = parts.shift();
        if (key === undefined) {
            return of(form);
        }

        if (form.type === 'array') {
            const index = parseInt(key, 10);
            if (isNaN(parseInt(key, 10))) {
                return of(null);
            }
            return (form as FA).controls$.pipe(
                switchMap((controls) => this._getChild(controls[index], parts))
            );
        }
        if (form.type === 'group') {
            const control = (form as FG).controls[key];
            if (!control) {
                return of(null);
            }
            return this._getChild(control, parts);
        }
        return of(null);
    }

    private readonly _validators: ValidatorOperations;
    get validators(): ValidatorOperations {
        return this._validators;
    }

    public enable(emitEvent = true, enableAncestors = false) {
        // this is needed!
        // it is possible to enable an enabled control again
        // this will re-enable all child controls, which we might have changed
        if (this.enabled()) {
            return;
        }

        this.__private_control.enable({
            onlySelf: !enableAncestors,
            emitEvent: emitEvent,
        });
    }
    public disable(emitEvent = true, disableAncestors = false) {
        // this is needed!
        // it is possible to disable an disable control again
        // this will re-disable all child controls, which we might have changed
        if (!this.enabled()) {
            return;
        }
        this.__private_control.disable({
            onlySelf: !disableAncestors,
            emitEvent: emitEvent,
        });
    }
    /**
     * Recalculates the value and validation status of the control.
     *
     * By default, it also updates the value and validity of its ancestors.
     *
     * @param opts Configuration options determine how the control propagates changes and emits events
     * after updates and validity checks are applied.
     * * `onlySelf`: When true, only update this control. When false or not supplied,
     * update all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `statusChanges`,
     * `valueChanges` and `events`
     * observables emit events with the latest status and value when the control is updated.
     * When false, no events are emitted.
     */
    updateValueAndValidity(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.__private_control.updateValueAndValidity(opts);
    }

    public async isInvalid() {
        return firstValueFrom(
            this.meta$.pipe(
                map((e) => {
                    if (e.validity === 'INVALID') {
                        return true;
                    } else if (e.validity !== 'PENDING') {
                        return false;
                    }
                    return undefined;
                }),
                filter((e) => e !== undefined)
            )
        );
    }

    public printHierarchy() {
        return AC._getHierarchyData(this);
    }

    private static _getHierarchyData(control: AC, name = ''): ACHierarchyData {
        if (control.meta().validity !== control.__private_control.status) {
            throw new Error(
                `Control ${
                    name ?? control.id
                } has a different status than the meta. ${
                    control.__private_control.status
                } != ${control.meta().validity}`
            );
        }
        const ret = {
            status: control.meta().validity,
            value: control.value(),
            meta: control.meta(),
        } as ACHierarchyData;
        if (control.type === 'group') {
            const group = control as FG;
            ret.children = Object.keys(group.controls).reduce((acc, key) => {
                const child = group.controls[key];
                if (child) {
                    acc[key] = this._getHierarchyData(child, key);
                }
                return acc;
            }, {} as { [key: string]: ACHierarchyData });
        }
        if (control.type === 'array') {
            const arr = control as FA;
            ret.children = arr.controls$.value.reduce((acc, child, index) => {
                if (child) {
                    acc[index] = this._getHierarchyData(
                        child,
                        index.toString()
                    );
                }
                return acc;
            }, {} as { [key: string]: ACHierarchyData });
        }

        return ret;
    }
    destroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.length = 0;
        this.childList.forEach((child) => child.destroy());
    }
}
export abstract class ACTyped<TChild extends AC, TValue> extends AC<TValue> {
    // registerParentEnableChange(callback: (enabled: boolean) => void): TChild {
    //     this.subscriptions.push(
    //         this.afterParentEnableChange.subscribe((e) => callback(e))
    //     );
    //     return this as unknown as TChild;
    // }
    registerEnableChange(callback: (enabled: boolean) => void): TChild {
        this.subscriptions.push(this.enabled$.subscribe((e) => callback(e)));
        return this as unknown as TChild;
    }

    registerMetaChange(callback: (meta: AbstractControlMeta) => void): TChild {
        this.subscriptions.push(this.meta$.subscribe((meta) => callback(meta)));
        return this as unknown as TChild;
    }
    forceAlwaysDisabled(): TChild {
        this.__private_control.disable();
        this.subscriptions.push(
            this.meta$.subscribe((meta) => {
                if (meta.enabled) {
                    this.__private_control.disable();
                }
            })
        );
        return this as unknown as TChild;
    }
    // override forceAlwaysEnabled(): TChild {
    //   this.control.enable();
    //   this.registerParentEnableChange(true, () => this.control.enable());
    //   this.registerEnableChange(true, () => this.control.enable());
    //   return this as unknown as TChild;
    // }
}

export class ValidatorOperations {
    constructor(private control: AbstractControl) {}

    /**
     * Sets the synchronous validators that are active on this control.  Calling
     * this overwrites any existing synchronous validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * If you want to add a new validator without affecting existing ones, consider
     * using `addValidators()` method instead.
     */
    setValidators(validators: ValidatorFn | ValidatorFn[] | null): void {
        this.control.setValidators(validators);
    }
    /**
     * Sets the asynchronous validators that are active on this control. Calling this
     * overwrites any existing asynchronous validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * If you want to add a new validator without affecting existing ones, consider
     * using `addAsyncValidators()` method instead.
     */
    setAsyncValidators(
        validators: AsyncValidatorFn | AsyncValidatorFn[] | null
    ): void {
        this.control.setAsyncValidators(validators);
    }
    /**
     * Add a synchronous validator or validators to this control, without affecting other validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * Adding a validator that already exists will have no effect. If duplicate validator functions
     * are present in the `validators` array, only the first instance would be added to a form
     * control.
     *
     * @param validators The new validator function or functions to add to this control.
     */
    addValidators(validators: ValidatorFn | ValidatorFn[]): void {
        this.control.addValidators(validators);
    }
    /**
     * Add an asynchronous validator or validators to this control, without affecting other
     * validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * Adding a validator that already exists will have no effect.
     *
     * @param validators The new asynchronous validator function or functions to add to this control.
     */
    addAsyncValidators(
        validators: AsyncValidatorFn | AsyncValidatorFn[]
    ): void {
        this.control.addAsyncValidators(validators);
    }
    /**
     * Remove a synchronous validator from this control, without affecting other validators.
     * Validators are compared by function reference; you must pass a reference to the exact same
     * validator function as the one that was originally set. If a provided validator is not found,
     * it is ignored.
     *
     * @usageNotes
     *
     * ### Reference to a ValidatorFn
     *
     * ```
     * // Reference to the RequiredValidator
     * const ctrl = new FormControl<string | null>('', Validators.required);
     * ctrl.removeValidators(Validators.required);
     *
     * // Reference to anonymous function inside MinValidator
     * const minValidator = Validators.min(3);
     * const ctrl = new FormControl<string | null>('', minValidator);
     * expect(ctrl.hasValidator(minValidator)).toEqual(true)
     * expect(ctrl.hasValidator(Validators.min(3))).toEqual(false)
     *
     * ctrl.removeValidators(minValidator);
     * ```
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * @param validators The validator or validators to remove.
     */
    removeValidators(validators: ValidatorFn | ValidatorFn[]): void {
        this.control.removeValidators(validators);
    }
    /**
     * Remove an asynchronous validator from this control, without affecting other validators.
     * Validators are compared by function reference; you must pass a reference to the exact same
     * validator function as the one that was originally set. If a provided validator is not found, it
     * is ignored.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * @param validators The asynchronous validator or validators to remove.
     */
    removeAsyncValidators(
        validators: AsyncValidatorFn | AsyncValidatorFn[]
    ): void {
        this.control.removeAsyncValidators(validators);
    }
    /**
     * Check whether a synchronous validator function is present on this control. The provided
     * validator must be a reference to the exact same function that was provided.
     *
     * @usageNotes
     *
     * ### Reference to a ValidatorFn
     *
     * ```
     * // Reference to the RequiredValidator
     * const ctrl = new FormControl<number | null>(0, Validators.required);
     * expect(ctrl.hasValidator(Validators.required)).toEqual(true)
     *
     * // Reference to anonymous function inside MinValidator
     * const minValidator = Validators.min(3);
     * const ctrl = new FormControl<number | null>(0, minValidator);
     * expect(ctrl.hasValidator(minValidator)).toEqual(true)
     * expect(ctrl.hasValidator(Validators.min(3))).toEqual(false)
     * ```
     *
     * @param validator The validator to check for presence. Compared by function reference.
     * @returns Whether the provided validator was found on this control.
     */
    hasValidator(validator: ValidatorFn): boolean {
        return this.control.hasValidator(validator);
    }
    /**
     * Check whether an asynchronous validator function is present on this control. The provided
     * validator must be a reference to the exact same function that was provided.
     *
     * @param validator The asynchronous validator to check for presence. Compared by function
     *     reference.
     * @returns Whether the provided asynchronous validator was found on this control.
     */
    hasAsyncValidator(validator: AsyncValidatorFn): boolean {
        return this.control.hasAsyncValidator(validator);
    }
    /**
     * Empties out the synchronous validator list.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     */
    clearValidators(): void {
        this.control.clearValidators();
    }
    /**
     * Empties out the async validator list.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     */
    clearAsyncValidators(): void {
        this.control.clearAsyncValidators();
    }
}

export class AbstractControlMeta {
    private constructor(
        public touched: boolean,
        public validity: FormControlStatus,
        public dirty: boolean,
        public enabled: boolean,
        public errors: ValidationErrors | null,
        public childControls: AbstractControlMeta[] | undefined
    ) {}

    static fromControl(control: AC): AbstractControlMeta {
        let childControls: AbstractControlMeta[] | undefined = undefined;

        return new AbstractControlMeta(
            control.__private_control.touched,
            control.__private_control.status,
            control.__private_control.dirty,
            control.__private_control.enabled,
            control.__private_control.errors,
            control.childList.map((c) => AbstractControlMeta.fromControl(c))
        );
    }

    hasError(errorCode?: string, requireTouched = true): boolean {
        return AbstractControlMeta._hasError(this, errorCode, requireTouched);
    }
    getErrorValue(errorCode: string, requireTouched = true): any | undefined {
        return AbstractControlMeta._getErrorValue(
            this,
            errorCode,
            requireTouched
        );
    }

    private static _hasError(
        meta?: AbstractControlMeta,
        errorCode?: string,
        requireTouched = true
    ): boolean {
        if (!meta) {
            return false;
        }
        if (
            (!requireTouched || meta.touched) &&
            meta.validity === 'INVALID' &&
            meta.errors &&
            (!errorCode
                ? Object.keys(meta.errors).length > 0
                : errorCode in meta.errors)
        ) {
            return true;
        }
        if (meta.childControls) {
            return meta.childControls.some((c) =>
                this._hasError(c, errorCode, requireTouched)
            );
        }
        return false;
    }
    private static _getErrorValue(
        meta: AbstractControlMeta,
        errorCode: string,
        requireTouched = true
    ): any | undefined {
        if (!meta) {
            return undefined;
        }
        if (
            (!requireTouched || meta.touched) &&
            meta.validity === 'INVALID' &&
            meta.errors &&
            errorCode in meta.errors
        ) {
            return meta.errors[errorCode];
        }
        if (meta.childControls) {
            for (const c of meta.childControls) {
                const value = this._getErrorValue(c, errorCode, requireTouched);
                if (value) {
                    return value;
                }
            }
        }
        return undefined;
    }

    public static compare(
        a: AbstractControlMeta,
        b: AbstractControlMeta
    ): boolean {
        const baseEqual =
            a.touched === b.touched &&
            a.validity === b.validity &&
            a.dirty === b.dirty &&
            a.enabled === b.enabled &&
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
    private static validationErrorsEqual(
        a: ValidationErrors | null,
        b: ValidationErrors | null
    ): boolean {
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
            if (typeof a[key] === 'object') {
                if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
                    return false;
                }
            } else {
                if (a[key] !== b[key]) {
                    return false;
                }
            }
        }
        return true;
    }
}
export interface ACHierarchyData {
    status: FormControlStatus;
    value: any;
    meta: AbstractControlMeta;
    children?: { [key: string]: ACHierarchyData };
}
