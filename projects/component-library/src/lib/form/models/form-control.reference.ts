import { AsyncValidatorFn, FormControl, ValidatorFn } from '@angular/forms';
import { Primitive } from '../types/primitive';
import { AC, ACRegisterFunctions, ACTyped } from './abstract-control.reference';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, pairwise, startWith, Subscription } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';

export class FC<T extends Primitive | Primitive[] = any> extends ACTyped<FC<T>, T> {
    override registerFn: FCRegisterFunctions<T>;
    protected override readonly _value: WritableSignal<T>;
    override readonly _value$: BehaviorSubject<T>;
    constructor(params: { defaultValue: T; initialDisabled?: boolean; validators?: ValidatorFn | ValidatorFn[]; asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[]; updateOn?: 'change' | 'blur' | 'submit' }) {
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

        this._value$ = new BehaviorSubject<T>(params.defaultValue);
        this._value = signal<T>(this._value$.value);
        this.subscriptions.push(
            control.valueChanges
                .pipe(
                    startWith(control.value),
                    distinctUntilChanged((a, b) => {
                        if (!a && !b) {
                            return true;
                        }
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
                this._value.set(v);
            }),
        );
        this.registerFn = new FCRegisterFunctions<T>(this, this.subscriptions);
    }
}

export class FCRegisterFunctions<T extends Primitive | Primitive[] = any> extends ACRegisterFunctions<ACTyped<FC<T>, T>, FC<T>, T> {
    constructor(control: FC<T>, subscriptions: Subscription[] = []) {
        super(control, subscriptions);
    }

    /**
     * Registers a callback to be called when the value of the control changes.
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    valueChange(callback: (value: T, oldValue: T | undefined, control: FC<T>) => void, alsoRunOnEnabled: boolean = false, alsoRunOnDisabled: boolean = false): FC<T> {
        const subs: [Observable<[T | undefined, T]>, Observable<boolean>?] = [
            this.control.value$.pipe(
                startWith(undefined as unknown as T),
                pairwise(),
                map((v) => [v[0] as T | undefined, v[1] === undefined ? v[0] : v[1]]),
            ),
        ];
        const ctrl = this.control as unknown as FC<T>;
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
                callback(v[1], v[0], ctrl);
            }),
        );
        return ctrl;
    }
}
