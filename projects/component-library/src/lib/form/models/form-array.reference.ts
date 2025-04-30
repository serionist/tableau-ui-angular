import {
    FormArray,
    FormGroup,
    FormControl,
    ValidatorFn,
    AsyncValidatorFn,
} from '@angular/forms';
import { ControlsOf } from '../types/controls-of';
import { Primitive } from '../types/primitive';
import { AC, ACTyped } from './abstract-control.reference';
import { FC } from './form-control.reference';
import { FG } from './form-group.reference';
import { DeepPartial } from '../types/deep-partial';
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    filter,
    Observable,
    startWith,
} from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { ReadonlyBehaviorSubject } from '../types/readonly-behaviorsubject';

export class FA<TItem extends Record<string, any> = any> extends ACTyped<
    FA<TItem>,
    DeepPartial<TItem>[]
> {
    protected override _value: WritableSignal<DeepPartial<TItem>[]>;
    protected override readonly _value$: BehaviorSubject<DeepPartial<TItem>[]>;
    private readonly _controls$: BehaviorSubject<FG<TItem>[]>;
    private readonly _controls: WritableSignal<FG<TItem>[]>;
    get controls$(): ReadonlyBehaviorSubject<FG<TItem>[]> {
        return this._controls$;
    }
    get controls(): WritableSignal<FG<TItem>[]> {
        return this._controls;
    }
    constructor(params: {
        controls: FG<TItem>[];
        validators?: ValidatorFn | ValidatorFn[];
        asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
        updateOn?: 'change' | 'blur' | 'submit';
    }) {
        const controlsArray = params.controls.map(
            (child) => child.__private_control as FormGroup<ControlsOf<TItem>>
        );

        const control = new FormArray(controlsArray, {
            validators: params.validators,
            asyncValidators: params.asyncValidators,
            updateOn: params.updateOn,
        });

        super('array', control, params.controls);
        this._controls$ = new BehaviorSubject<FG<TItem>[]>(params.controls);
        this._controls = signal(this._controls$.value);

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
                    })
                )
                .subscribe((v) => {
                    this._value$.next(v);
                })
        );
        this.subscriptions.push(
            this._value$.subscribe((v) => {
                this._value.set(v);
            })
        );
        this.subscriptions.push(
            this._controls$.subscribe((v) => this._controls.set(v))
        );
    }
    private get formArray() {
        return this.__private_control as FormArray<
            FormGroup<ControlsOf<TItem>>
        >;
    }

    /**
     * Registers a callback to be called when the value of the array changes.
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    registerValueChange(
        callback: (value: DeepPartial<TItem>[]) => void,
        alsoRunOnEnabled: boolean = false,
        alsoRunOnDisabled: boolean = false
    ): FA<TItem> {
        const subs: [Observable<DeepPartial<TItem>[]>, Observable<boolean>?] = [
            this.value$,
        ];
        if (alsoRunOnEnabled || alsoRunOnDisabled) {
            subs.push(
                this.enabled$.pipe(
                    filter((enabled) => {
                        if (enabled && alsoRunOnEnabled) {
                            return true;
                        } else if (!enabled && alsoRunOnDisabled) {
                            return true;
                        }
                        return false;
                    })
                )
            );
        }
        this.subscriptions.push(
            combineLatest(subs).subscribe(([v, e]) => {
                callback(v);
            })
        );
        return this;
    }
    push(
        control: FG<TItem>,
        options?: {
            emitEvent?: boolean;
        }
    ) {
        this.formArray.push(
            control.__private_control as FormGroup<ControlsOf<TItem>>,
            options
        );
        this.childList.push(control);
        this._controls$.next([...this.controls$.value, control]);
    }

    removeAt(index: number, options?: { emitEvent?: boolean }) {
        this.formArray.removeAt(index, options);
        this.childList[index].destroy();
        this.childList.splice(index, 1);
        const controls = this.controls$.value;
        controls.splice(index, 1);
        this._controls$.next(controls);
    }
    insert(
        index: number,
        control: FG<TItem>,
        options?: {
            emitEvent?: boolean;
        }
    ) {
        this.formArray.insert(
            index,
            control.__private_control as FormGroup<ControlsOf<TItem>>,
            options
        );
        this.childList.splice(index, 0, control);
        const controls = this.controls$.value;
        controls.splice(index, 0, control);
        this._controls$.next(controls);
    }
    clear(options?: { emitEvent?: boolean }) {
        this.formArray.clear(options);
        this.childList.forEach((child) => {
            child.destroy();
        });
        this.childList.length = 0;
        this._controls$.next([]);
    }
    at(index: number): FG<TItem> {
        return this.controls$.value[index];
    }
    // setControl(
    //     index: number,
    //     control: TItem extends Record<string, any>
    //         ? FG<ControlsOf<TItem>>
    //         : TItem extends Primitive | Primitive[]
    //         ? FC<TItem>
    //         : never,
    //     options?: { emitEvent?: boolean }
    // ) {
    //     this.__private_control.setControl(index, control.__private_abstractcontrol as any, options);
    //     this.childList[index] = control;
    // }
}
