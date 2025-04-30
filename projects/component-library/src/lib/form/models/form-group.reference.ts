import {
    AbstractControl,
    AsyncValidatorFn,
    FormControl,
    FormGroup,
    ValidatorFn,
} from '@angular/forms';

import { ControlsOf } from '../types/controls-of';
import { FormReferencesOf } from '../types/form-references-of';
import { AC, ACTyped } from './abstract-control.reference';
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    Observable,
    startWith,
} from 'rxjs';
import { DeepPartial } from '../types/deep-partial';
import { Primitive } from '../types/primitive';
import { FC } from './form-control.reference';
import { signal, WritableSignal } from '@angular/core';

export class FG<TSource extends Record<string, any> = any> extends ACTyped<
    FG<TSource>,
    DeepPartial<TSource>
> {
    protected override _value: WritableSignal<DeepPartial<TSource>>;
    protected override readonly _value$: BehaviorSubject<DeepPartial<TSource>>;
    readonly controls: FormReferencesOf<TSource>;
    constructor(params: {
        controls: FormReferencesOf<TSource>;
        validators?: ValidatorFn | ValidatorFn[];
        asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
        updateOn?: 'change' | 'blur' | 'submit';
    }) {
        const controls = Object.entries(params.controls).reduce(
            (acc, [key, child]) => {
                acc[key as keyof TSource] = child['__private_control']; // Bracket access for protected fields
                return acc;
            },
            {} as Partial<ControlsOf<TSource>>
        );
        const control = new FormGroup<ControlsOf<TSource>>(
            controls as ControlsOf<TSource>,
            {
                validators: params.validators,
                asyncValidators: params.asyncValidators,
                updateOn: params.updateOn,
            }
        );

        const childList = Object.entries(params.controls).map(
            ([key, child]) => child as AC
        );
        super('group', control, childList);
        this.controls = params.controls;
        this._value$ = new BehaviorSubject<DeepPartial<TSource>>(control.value);
        this._value = signal<DeepPartial<TSource>>(this._value$.value);

        this.subscriptions.push(
            control.valueChanges
                .pipe(
                    startWith(control.value as DeepPartial<TSource>),
                    distinctUntilChanged((a, b) => {
                        if (!a && !b) {
                            return true;
                        }
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
    }

    /**
     * Registers a callback to be called when the value of the group changes.
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    registerValueChange(
        callback: (value: DeepPartial<TSource>) => void,
        alsoRunOnEnabled: boolean = false,
        alsoRunOnDisabled: boolean = false
    ): FG<TSource> {
        const subs: [Observable<DeepPartial<TSource>>, Observable<boolean>?] = [
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
    /**
     * Registers a callback to be called when the value of a child control changes
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    registerChildChange<T extends Primitive | Primitive[]>(
        formControlSelector: (children: FormReferencesOf<TSource>) => FC<T>,
        callback: (group: FG<TSource>, control: FC<T>, value: T) => void,
        alsoRunOnEnabled: boolean = false,
        alsoRunOnDisabled: boolean = false
    ): FG<TSource> {
        const ctrl = formControlSelector(this.controls);

        const subs: [Observable<T>, Observable<boolean>?] = [ctrl.value$.pipe(map(v => {
          if (alsoRunOnEnabled) {
          }
          return v;
        }))];
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
                    }),
                    
                    map(e => {
                      return e;
                    })
                )
            );
        }
        this.subscriptions.push(
            combineLatest(subs).subscribe(([v, e]) => {
                callback(this, ctrl, v);
            })
        );
        return this;
    }

    /**
     * Registers a callback to be called when the value of a child group changes
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    registerChildGroupChange<T extends Record<string, any>>(
        formControlSelector: (children: FormReferencesOf<TSource>) => FG<T>,
        callback: (
            group: FG<TSource>,
            control: FG<T>,
            value: DeepPartial<T>
        ) => void,
        alsoRunOnEnabled: boolean = false,
        alsoRunOnDisabled: boolean = false
    ): FG<TSource> {
        const ctrl = formControlSelector(this.controls);
        const subs: [Observable<DeepPartial<T>>, Observable<boolean>?] = [ctrl.value$];
        if (alsoRunOnEnabled || alsoRunOnDisabled) {
          subs.push(this.enabled$.pipe(filter(enabled => {
            if (enabled && alsoRunOnEnabled) {
                return true;
            } else if (!enabled && alsoRunOnDisabled) {
                return true;
            }
            return false;
          })))
        }
        this.subscriptions.push(
            combineLatest(subs).subscribe(([v, e]) => {
                callback(this, ctrl, v);
            })
        );
        return this;
    }
}
