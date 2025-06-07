import type { FormGroup, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { FormArray, FormControl } from '@angular/forms';
import type { ControlsOf } from '../types/controls-of';
import { Primitive } from '../types/primitive';
import { AC, ACRegisterFunctions, ACTyped } from './abstract-control.reference';
import { FC } from './form-control.reference';
import type { FG } from './form-group.reference';
import type { DeepPartial } from '../types/deep-partial';
import type { Observable, Subscription } from 'rxjs';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, pairwise, startWith } from 'rxjs';
import type { Signal, WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import type { ReadonlyBehaviorSubject } from '../types/readonly-behaviorsubject';
import { ControlRegistry } from './control-registry';

export class FA<TItem extends Record<string, any> = any> extends ACTyped<FA<TItem>, DeepPartial<TItem>[]> {
    override registerFn: FARegisterFunctions<TItem>;
    protected override readonly _value: WritableSignal<DeepPartial<TItem>[]>;
    protected override readonly _value$: BehaviorSubject<DeepPartial<TItem>[]>;
    get controls$(): ReadonlyBehaviorSubject<FG<TItem>[]> {
        return this.hierarchy.childList$ as unknown as ReadonlyBehaviorSubject<FG<TItem>[]>;
    }
    private readonly _controls: WritableSignal<FG<TItem>[]>;
    get $controls(): Signal<FG<TItem>[]> {
        return this._controls;
    }
    constructor(params: { controls: FG<TItem>[]; validators?: ValidatorFn | ValidatorFn[]; asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[]; updateOn?: 'change' | 'blur' | 'submit' }) {
        const controlsArray = params.controls.map((child) => {
            const control = ControlRegistry.controls.get(child.id);
            if (!control) {
                throw new Error(`Control with id ${child.id} not found in registry.`);
            }
            return control as FormGroup<ControlsOf<TItem>>;
        });

        const control = new FormArray(controlsArray, {
            validators: params.validators,
            asyncValidators: params.asyncValidators,
            updateOn: params.updateOn,
        });

        super('array', control, params.controls);
        this.registerFn = new FARegisterFunctions<TItem>(this, this.subscriptions);
        this._controls = signal(this.controls$.value);

        this._value$ = new BehaviorSubject<DeepPartial<TItem>[]>(control.value);
        this._value = signal(control.value);

        this.subscriptions.push(
            control.valueChanges
                .pipe(
                    startWith(control.value),
                    distinctUntilChanged((a, b) => {
                        const aArr = a as TItem[];
                        const bArr = b as TItem[];
                        if (aArr.length !== bArr.length) {
                            return false;
                        }
                        for (let i = 0; i < a.length; i++) {
                            const ai = a[i] as any;
                            const bi = b[i] as any;
                            if (ai?.ref?.id && bi?.ref?.id) {
                                if (ai.ref.id !== bi.ref.id) {
                                    return false;
                                }
                            } else {
                                if (ai !== bi) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    }),
                )
                .subscribe((v) => {
                    this._value$.next(v);
                }),
        );
        this.subscriptions.push(
            this._value$.subscribe((v) => {
                this._value.set(v);
            }),
        );
        this.subscriptions.push(this.controls$.subscribe((v) => { this._controls.set(v); }));
    }
    private get formArray() {
        return this.control as FormArray<FormGroup<ControlsOf<TItem>>>;
    }

    push(
        control: FG<TItem>,
        options?: {
            emitEvent?: boolean;
        },
    ) {
        const c = ControlRegistry.controls.get(control.id);
        if (!c) {
            throw new Error(`Control with id ${control.id} not found in registry.`);
        }
        this.formArray.push(c as FormGroup<ControlsOf<TItem>>, options);
        const childList = this.hierarchy.childList$.value;
        childList.push(control);
        this.hierarchy.childList$.next(childList);
    }

    removeAt(index: number, destroyControl: boolean, options?: { emitEvent?: boolean }) {
        this.formArray.removeAt(index, options);
        const childList = this.hierarchy.childList$.value;
        const control = childList.splice(index, 1)[0];
        if (control && destroyControl) {
            control.destroy();
        }
        this.hierarchy.childList$.next(childList);
    }
    insert(
        index: number,
        control: FG<TItem>,
        options?: {
            emitEvent?: boolean;
        },
    ) {
        const c = ControlRegistry.controls.get(control.id);
        if (!c) {
            throw new Error(`Control with id ${control.id} not found in registry.`);
        }

        this.formArray.insert(index, c as FormGroup<ControlsOf<TItem>>, options);
        const childList = this.hierarchy.childList$.value;
        childList.splice(index, 0, control);
        this.hierarchy.childList$.next(childList);
    }
    clear(destroyControls: boolean, options?: { emitEvent?: boolean }) {
        this.formArray.clear(options);
        const childList = this.hierarchy.childList$.value;
        if (destroyControls) {
            childList.forEach((child) => {
                child.destroy();
            });
        }
        this.hierarchy.childList$.next([]);
    }
    at(index: number): FG<TItem> {
        return this.controls$.value[index];
    }
}
export class FARegisterFunctions<TItem extends Record<string, any> = any> extends ACRegisterFunctions<ACTyped<FA<TItem>, DeepPartial<TItem>[]>, FA<TItem>, DeepPartial<TItem>[]> {
    constructor(
        protected override control: FA<TItem>,
        subscriptions: Subscription[] = [],
    ) {
        super(control, subscriptions);
    }

    /**
     * Registers a callback to be called when the value of the array changes.
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    valueChange(
        callback: (value: DeepPartial<TItem>[], oldValue: DeepPartial<TItem>[] | undefined, controls: FG<TItem>[], control: FA<TItem>) => void,
        alsoRunOnEnabled: boolean = false,
        alsoRunOnDisabled: boolean = false,
    ): FA<TItem> {
        const subs: [Observable<[DeepPartial<TItem>[] | undefined, DeepPartial<TItem>[]]>, Observable<boolean>?] = [
            this.control.value$.pipe(
                startWith(undefined as unknown as DeepPartial<TItem[]>),
                pairwise(),
                map((v) => [v[0] as DeepPartial<TItem>[] | undefined, (v[1] === undefined ? v[0] : v[1]) as DeepPartial<TItem>[]]),
            ),
        ];
        const control = this.control as unknown as FA<TItem>;
        if (alsoRunOnEnabled || alsoRunOnDisabled) {
            subs.push(
                this.control.meta$.pipe(
                    map((e) => e.enabled),
                    filter((enabled) => {
                        if (enabled && alsoRunOnEnabled) {
                            return true;
                        } else if (!enabled && alsoRunOnDisabled) {
                            return true;
                        }
                        return false;
                    }),
                ),
            );
        }
        this.subscriptions.push(
            combineLatest(subs).subscribe(([v, e]) => {
                callback(v[1], v[0], this.control.$controls(), control);
            }),
        );
        return control;
    }
}
