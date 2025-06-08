import type { Signal, WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import type { Observable} from 'rxjs';
import { BehaviorSubject, distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { ACImpl } from '../abstract-control/impl';
import type { AC } from '../abstract-control/interfaces';
import type { MetaFns } from '../abstract-control/meta/interfaces';
import { RegisterFns } from '../abstract-control/register/interfaces';
import type { AsyncValidatorFn, ValidatorFn, ValidatorFns } from '../abstract-control/validation/interfaces';
import type { FG } from './interfaces';
import type { FgRegisterFns } from './register/interfaces';
import { FormGroup, FormResetEvent } from '@angular/forms';
import type { ControlsOf } from '../../types/controls-of';
import type { FormReferencesOf } from '../../types/form-references-of';
import type { DeepPartial } from '../../types/deep-partial';
import { FgRegisterFnsImpl } from './register/impl';
import { ValidatorFnsImpl } from '../abstract-control/validation/impl';
import { MetaFnsImpl } from '../abstract-control/meta/impl';


export class FGImpl<T extends Record<string, unknown>> extends ACImpl<T> implements FG<T> {
    private readonly _value$: BehaviorSubject<DeepPartial<T>>;
    private readonly $_value: WritableSignal<DeepPartial<T>>;
    private readonly _rawValue$: BehaviorSubject<T>;
    private readonly $_rawValue: WritableSignal<T>;
    public override get value$(): Observable<DeepPartial<T>> {
        return this._value$.asObservable();
    }
    public override get $value(): Signal<DeepPartial<T>> {
        return this.$_value;
    }
    public get rawValue$(): Observable<T> {
        return this._rawValue$.asObservable();
    }
    public get $rawValue(): Signal<T> {
        return this.$_rawValue;
    }

    readonly controls: FormReferencesOf<T>;

    public override readonly submitted$: Observable<DeepPartial<T>>;
    public override readonly reset$: Observable<DeepPartial<T>>;
    public override readonly validatorFn: ValidatorFns<FG<T>>;
    public override readonly metaFn: MetaFns<FG<T>>;
    public override readonly registerFn: FgRegisterFns<T>;

    constructor(params: { controls: FormReferencesOf<T>; validators?: ValidatorFn | ValidatorFn[]; asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[]; updateOn?: 'blur' | 'change' | 'submit' }) {
        const controls = Object.entries(params.controls).reduce<Partial<ControlsOf<T>>>((acc, [key, child]) => {
            const c = (child as ACImpl<unknown>).control;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
            acc[key as keyof T] = c as any;
            return acc;
        }, {});

        const control = new FormGroup<ControlsOf<T>>(controls as ControlsOf<T>, {
            validators: params.validators,
            asyncValidators: params.asyncValidators,
            updateOn: params.updateOn,
        });

        const childList = Object.entries(params.controls).map(([key, child]) => child as AC);
        super('group', control, childList);

        this.controls = params.controls;
        this._value$ = new BehaviorSubject<DeepPartial<T>>(control.value);
        this.$_value = signal<DeepPartial<T>>(this._value$.value);
        this._rawValue$ = new BehaviorSubject<T>(control.getRawValue() as T);
        this.$_rawValue = signal<T>(this._rawValue$.value);
        this.subscriptions.push(
            control.valueChanges
                .pipe(
                    startWith(control.value as DeepPartial<T>),
                    distinctUntilChanged((a, b) => {
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        if (!a && !b) {
                            return true;
                        }
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        if (!a || !b) {
                            return false;
                        }
                        if (typeof a === 'object' && typeof b === 'object') {
                            try {
                                return JSON.stringify(a) === JSON.stringify(b);
                            } catch (e) {
                                return false;
                            }
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
                const rawValue = control.getRawValue() as T;
                this._rawValue$.next(rawValue);
                this.$_rawValue.set(rawValue);
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
        this.registerFn = new FgRegisterFnsImpl<T>(this, this.subscriptions);
        this.validatorFn = new ValidatorFnsImpl<FG<T>>(this.control);
        this.metaFn = new MetaFnsImpl<FG<T>>(this.control, this);
    }

    setValue(value: T, options?: { onlySelf?: boolean; emitEvent?: boolean; emitModelToViewChange?: boolean; emitViewToModelChange?: boolean; }) {
        this.control.setValue(value, {
            onlySelf: options?.onlySelf ?? false,
            emitEvent: options?.emitEvent ?? true,
            emitModelToViewChange: options?.emitModelToViewChange ?? true,
            emitViewToModelChange: options?.emitViewToModelChange ?? true,
        });
    }
}
