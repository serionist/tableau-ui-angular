import type { Signal } from '@angular/core';
import type { MetaFns } from '../abstract-control/meta/interfaces';
import type { ValidatorFns } from '../abstract-control/validation/interfaces';
import type { AC } from '../abstract-control/interfaces';
import type { Observable } from 'rxjs';
import type { FcRegisterFns } from './register/interfaces';
import type { PrimitiveWithUndefined } from './types';

export interface FC<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]> extends AC {
    value$: Observable<T>;
    $value: Signal<T>;
    submitted$: Observable<T>;
    reset$: Observable<T>;
    validatorFn: ValidatorFns<FC<T>>;
    metaFn: MetaFns<FC<T>>;
    registerFn: FcRegisterFns<T>;

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
    setValue: (
        value: T,
        options?: {
            onlySelf?: boolean;
            emitEvent?: boolean;
            emitModelToViewChange?: boolean;
            emitViewToModelChange?: boolean;
        },
    ) => void;


    /**
     * Resets the control, marking it `pristine` and `untouched`, and resetting
     * the value to its initial value
     *
     * @param updateParentsValue If true, updates the value of parent controls.
     * @param emitEvent If true, emits the `valueChanges` event after resetting.
     */
    resetWithDefaultValue: (updateParentsValue?: boolean, emitEvent?: boolean) => void;


    /**
      * Resets the form control, marking it `pristine` and `untouched`, and resetting
      * the value to the provided value
      * @param value 
      * @param updateParentsValue If true, updates the value of parent controls.
      * @param emitEvent If true, emits the `valueChanges` event after resetting.
      * @returns 
       */
    reset: (value: T, updateParentsValue?: boolean, emitEvent?: boolean) => void;
}
