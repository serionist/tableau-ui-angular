import type { Signal, WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { ACImpl } from '../abstract-control/impl';
import type { MetaFns } from '../abstract-control/meta/interfaces';
import type { AsyncValidatorFn, ValidatorFn, ValidatorFns } from '../abstract-control/validation/interfaces';
import type { FC } from './interfaces';
import type { FcRegisterFns } from './register/interfaces';
import { FormControl, FormResetEvent } from '@angular/forms';
import { ValidatorFnsImpl as ValidatorFnsImpl } from '../abstract-control/validation/impl';
import { MetaFnsImpl as MetaFnsImpl } from '../abstract-control/meta/impl';
import { FcRegisterFnsImpl } from './register/impl';
import type { PrimitiveWithUndefined } from './types';

export class FCImpl<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]> extends ACImpl<T> implements FC<T> {
    private readonly _value$: BehaviorSubject<T>;
    private readonly $_value: WritableSignal<T>;

    public override get value$(): Observable<T> {
        return this._value$.asObservable();
    }
    public override get $value(): Signal<T> {
        return this.$_value;
    }
    public override readonly submitted$: Observable<T>;
    public override readonly reset$: Observable<T>;
    public override readonly validatorFn: ValidatorFns<FC<T>>;
    public override readonly metaFn: MetaFns<FC<T>>;
    public override readonly registerFn: FcRegisterFns<T>;
    private readonly _defaultValue: T;
    public override get defaultValue(): T {
        return this._defaultValue;
    };
    private readonly _control: FormControl<T>;
    constructor(params: { defaultValue: T; initialDisabled?: boolean; validators?: ValidatorFn | ValidatorFn[]; asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[]; updateOn?: 'blur' | 'change' | 'submit' }) {
        const control = new FormControl<T>(
            {
                value: params.defaultValue,
                disabled: params.initialDisabled ?? false,
            },
            {
                nonNullable: true,
                updateOn: params.updateOn,
                asyncValidators: params.asyncValidators,
                validators: params.validators,
            },
        );
        super('control', control, []);
        this._control = control;
        this._defaultValue = params.defaultValue;
        this._value$ = new BehaviorSubject<T>(params.defaultValue);
        this.$_value = signal<T>(this._value$.value);
        this.subscriptions.push(
            control.valueChanges
                .pipe(
                    startWith(control.value),
                    distinctUntilChanged((a, b) => {
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        if (!a && !b) {
                            return true;
                        }
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        if (!a || !b) {
                            return false;
                        }
                        if (Array.isArray(a) && Array.isArray(b)) {
                            if (a.length !== b.length) {
                                return false;
                            }
                            for (let i = 0; i < a.length; i++) {
                                if (a[i] !== b[i]) {
                                    return false;
                                }
                            }
                            return true;
                        }
                        return a === b;
                    }),
                )
                .subscribe((v) => {
                    this._value$.next(v);
                }),
        );
        this.subscriptions.push(
            this._value$.subscribe((v) => {
                this.$_value.set(v);
            }),
        );
        this.submitted$ = this.control.events.pipe(
            filter((e) => e instanceof SubmitEvent),
            map(() => this._value$.value),
        );
        this.reset$ = this.control.events.pipe(
            filter((e) => e instanceof FormResetEvent),
            map(() => this._value$.value),
        );
        this.registerFn = new FcRegisterFnsImpl<T>(this, this.subscriptions);
        this.validatorFn = new ValidatorFnsImpl<FC<T>>(this.control);
        this.metaFn = new MetaFnsImpl<FC<T>>(this.control, this);
    }

    setValue(value: T, options?: { onlySelf?: boolean; emitEvent?: boolean; emitModelToViewChange?: boolean; emitViewToModelChange?: boolean }) {
        this.control.setValue(value, {
            onlySelf: options?.onlySelf ?? false,
            emitEvent: options?.emitEvent ?? true,
            emitModelToViewChange: options?.emitModelToViewChange ?? true,
            emitViewToModelChange: options?.emitViewToModelChange ?? true,
        });
    }

    resetWithDefaultValue(updateParentsValue: boolean = true, emitEvent: boolean = true) {
        this._control.reset(this.defaultValue, { onlySelf: !updateParentsValue, emitEvent: emitEvent });
    }
    reset(value: T, updateParentsValue: boolean = true, emitEvent: boolean = true) {
        this._control.reset(value, { onlySelf: !updateParentsValue, emitEvent: emitEvent });
    }
}
