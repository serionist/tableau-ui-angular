import {
    AbstractControl,
    AsyncValidatorFn,
    ControlEvent,
    FormArray,
    FormControl,
    FormControlStatus,
    FormGroup,
    FormResetEvent,
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
import { ControlRegistry } from './control-registry';

export abstract class AC<TValue = any> {
    readonly id: number;
    readonly type: 'control' | 'group' | 'array';
    protected readonly control: AbstractControl;

    protected subscriptions: Subscription[] = [];

    readonly hierarchy: ACHierarchy;

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

    constructor(
        type: 'control' | 'group' | 'array',
        control: AbstractControl,
        childList: AC[] = []
    ) {
        this.id = ControlRegistry.register(control);
        this.control = control;
        this.hierarchy = new ACHierarchy(this, childList);
        this.subscriptions.push(
            this.hierarchy.childList$.subscribe((childList) => {
                childList.forEach((c) => {
                    c.hierarchy.parent = this;
                });
            })
        );
        this.type = type;
        const initialMeta = AbstractControlMeta.fromControl(this);
        this._meta$ = new BehaviorSubject<AbstractControlMeta>(initialMeta);
        this._metaSignal = signal<AbstractControlMeta>(initialMeta);
        this.subscriptions.push(
            this.control.events
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
    }
    public getRawValue(): TValue {
        return this.control.getRawValue() as TValue;
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
        this.control.setValue(value, options);
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
    updateValueAndValidity(
        includeAncestors: boolean,
        includeDescendants: boolean,
        markAsTouched: boolean,
        markAsDirty: boolean,
        emitEvent: boolean = true
    ): void {
        AC._updateValueAndValidity(
            this,
            includeAncestors,
            includeDescendants,
            markAsTouched,
            markAsDirty,
            emitEvent
        );
    }
    private static _updateValueAndValidity(
        f: AC,
        includeAncestors: boolean,
        includeDescendants: boolean,
        markAsTouched: boolean,
        markAsDirty: boolean,
        emitEvent: boolean
    ) {
        if (includeDescendants) {
            for (const child of f.hierarchy.childList$.value) {
                this._updateValueAndValidity(
                    child,
                    false,
                    includeDescendants,
                    markAsTouched,
                    markAsDirty,
                    emitEvent
                );
            }
        }

        if (markAsTouched) {
            f.control.markAsTouched({ onlySelf: true, emitEvent: false });
        }
        if (markAsDirty) {
            f.control.markAsDirty({ onlySelf: true, emitEvent: false });
        }
        f.control.updateValueAndValidity({ onlySelf: true, emitEvent });
        if (includeAncestors) {
            let parent = f.hierarchy.parent;
            while (parent) {
                this._updateValueAndValidity(
                    parent,
                    false,
                    false,
                    markAsTouched,
                    markAsDirty,
                    emitEvent
                );
                parent = parent.hierarchy.parent;
            }
        }
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

    destroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.length = 0;
        ControlRegistry.unregister(this.id);
        this.hierarchy.childList$.value.forEach((child) => child.destroy());
    }
}
export abstract class ACTyped<TChild extends AC, TValue> extends AC<TValue> {
    readonly submitted$: Observable<TChild>;
    readonly reset$: Observable<TChild>;
    readonly metaFn: ACMetaFunctions<TChild, TValue>;
    readonly validatorFn: ACValidators<TChild>;
    abstract readonly registerFn: ACRegisterFunctions<
        ACTyped<TChild, TValue>,
        TChild,
        TValue
    >;
    constructor(
        type: 'control' | 'group' | 'array',
        control: AbstractControl,
        childList: AC[] = []
    ) {
        super(type, control, childList);
        this.metaFn = new ACMetaFunctions(this.control, this);
        this.validatorFn = new ACValidators(this.control);
        this.submitted$ = this.control.events.pipe(
            filter((e) => e instanceof SubmitEvent),
            map(() => this as unknown as TChild)
        );
        this.reset$ = this.control.events.pipe(
            filter((e) => e instanceof FormResetEvent),
            map(() => this as unknown as TChild)
        );
    }
}
export class ACHierarchy {
    constructor(private ctrl: AC, initialChildren: AC[]) {
        this.childList$ = new BehaviorSubject<AC[]>(initialChildren);
    }

    /**
     *  The parent of this control
     */
    parent: AC | undefined;
    /**
     * The root of this control. This is the top level control in the tree.
     */
    get root(): AC | undefined {
        let parent = this.parent;
        while (parent) {
            if (parent.hierarchy.parent) {
                parent = parent.hierarchy.parent;
            } else {
                return parent;
            }
        }
        return undefined;
    }
    readonly childList$: BehaviorSubject<AC[]>;

    public getChild(path?: string | string[]): Observable<AC | null> {
        if (!path) {
            return ACHierarchy._getChild(this.ctrl, []);
        }
        if (typeof path === 'string') {
            path = path.split('.').filter((p) => p !== '');
        }
        return ACHierarchy._getChild(this.ctrl, path).pipe(
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
    public printHierarchy() {
        return ACHierarchy._getHierarchyData(this.ctrl);
    }

    private static _getHierarchyData(control: AC, name = ''): ACHierarchyData {
        const ctrl = ControlRegistry.controls.get(control.id);
        if (!ctrl) {
            throw new Error(
                `Control with id ${control.id} not found in registry.`
            );
        }
        if (control.meta().validity !== ctrl.status) {
            throw new Error(
                `Control ${
                    name ?? control.id
                } has a different status than the meta. ${ctrl.status} != ${
                    control.meta().validity
                }`
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
}
export interface ACHierarchyData {
    status: FormControlStatus;
    value: any;
    meta: AbstractControlMeta;
    children?: { [key: string]: ACHierarchyData };
}

export class ACValidators<TChild extends AC, TValue = any> {
    constructor(private control: AbstractControl) {}

    /**
     * Returns the function that is used to determine the validity of this control synchronously.
     * If multiple validators have been added, this will be a single composed function.
     * See `Validators.compose()` for additional information.
     */
    get validator(): ValidatorFn | null {
        return this.control.validator;
    }
    /**
     * Sets the function that is used to determine the validity of this control synchronously.
     * It's recommended to use 'setValidators' or 'addValidators' instead, which will compose this function
     */
    set validator(validator: ValidatorFn | null) {
        this.control.validator = validator;
    }
    /**
     * Returns the function that is used to determine the validity of this control asynchronously.
     * If multiple validators have been added, this will be a single composed function.
     * See `Validators.compose()` for additional information.
     */
    get asyncValidator(): AsyncValidatorFn | null {
        return this.control.asyncValidator;
    }
    /**
     * Sets the function that is used to determine the validity of this control asynchronously.
     * It's recommended to use 'setAsyncValidators' or 'addAsyncValidators' instead, which will compose this function
     */
    set asyncValidator(asyncValidatorFn: AsyncValidatorFn | null) {
        this.control.asyncValidator = asyncValidatorFn;
    }

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
    setValidators(validators: ValidatorFn | ValidatorFn[] | null): TChild {
        this.control.setValidators(validators);
        return this.control as unknown as TChild;
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
    ): TChild {
        this.control.setAsyncValidators(validators);
        return this.control as unknown as TChild;
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
    addValidators(validators: ValidatorFn | ValidatorFn[]): TChild {
        this.control.addValidators(validators);
        return this.control as unknown as TChild;
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
    ): TChild {
        this.control.addAsyncValidators(validators);
        return this.control as unknown as TChild;
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
    removeValidators(validators: ValidatorFn | ValidatorFn[]): TChild {
        this.control.removeValidators(validators);
        return this.control as unknown as TChild;
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
    ): TChild {
        this.control.removeAsyncValidators(validators);
        return this.control as unknown as TChild;
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
    clearValidators(): TChild {
        this.control.clearValidators();
        return this.control as unknown as TChild;
    }
    /**
     * Empties out the async validator list.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     */
    clearAsyncValidators(): TChild {
        this.control.clearAsyncValidators();
        return this.control as unknown as TChild;
    }
}
export class ACMetaFunctions<TChild extends AC, TValue = any> {
    constructor(
        private control: AbstractControl,
        private ctrl: ACTyped<TChild, TValue>
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
    public setErrors(
        errors: ValidationErrors | null,
        emitEvent = true
    ): TChild {
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
export class ACRegisterFunctions<
    TACTyped extends ACTyped<TChild, TValue>,
    TChild extends AC,
    TValue = any
> {
    constructor(
        protected control: TACTyped,
        protected subscriptions: Subscription[]
    ) {}

    registerEnableChange(callback: (enabled: boolean) => void): TChild {
        this.subscriptions.push(
            this.control.meta$
                .pipe(
                    map((e) => e.enabled),
                    distinctUntilChanged()
                )
                .subscribe((e) => callback(e))
        );
        return this.control as unknown as TChild;
    }

    registerMetaChange(callback: (meta: AbstractControlMeta) => void): TChild {
        this.subscriptions.push(
            this.control.meta$.subscribe((meta) => callback(meta))
        );
        return this.control as unknown as TChild;
    }
    forceAlwaysDisabled(): TChild {
        this.control.metaFn.disable();
        this.subscriptions.push(
            this.control.meta$.subscribe((meta) => {
                if (meta.enabled) {
                    this.control.metaFn.disable();
                }
            })
        );
        return this.control as unknown as TChild;
    }
    // override forceAlwaysEnabled(): TChild {
    //   this.control.enable();
    //   this.registerParentEnableChange(true, () => this.control.enable());
    //   this.registerEnableChange(true, () => this.control.enable());
    //   return this as unknown as TChild;
    // }
}

export class AbstractControlMeta {
    private constructor(
        public readonly untouched: boolean,
        public readonly touched: boolean,
        public readonly validity: FormControlStatus,
        public readonly pristine: boolean,
        public readonly dirty: boolean,
        public readonly enabled: boolean,
        public readonly disabled: boolean,
        public readonly updateOn: 'change' | 'blur' | 'submit',
        public readonly errors: ValidationErrors | null,
        public readonly childControls:
            | readonly AbstractControlMeta[]
            | undefined
    ) {}

    static fromControl(control: AC): AbstractControlMeta {
        let childControls: AbstractControlMeta[] | undefined = undefined;
        const c = ControlRegistry.controls.get(control.id);
        if (!c) {
            throw new Error(
                `Control with id ${control.id} not found in registry.`
            );
        }
        return new AbstractControlMeta(
            c.untouched,
            c.touched,
            c.status,
            c.pristine,
            c.dirty,
            c.enabled,
            c.disabled,
            c.updateOn,
            c.errors,
            control.hierarchy.childList$.value.map((c) =>
                AbstractControlMeta.fromControl(c)
            )
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
    private static validationErrorsEqual(a: any, b: any): boolean {
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

            if (Array.isArray(a[key]) && !Array.isArray(b[key])) {
                if (a[key].length !== b[key].length) {
                    return false;
                }
                for (let i = 0; i < a[key].length; i++) {
                    if (!this.validationErrorsEqual(a[key][i], b[key][i])) {
                        return false;
                    }
                }
            } else if (
                typeof a[key] === 'object' &&
                typeof b[key] === 'object'
            ) {
                if (!this.validationErrorsEqual(a[key], b[key])) {
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
