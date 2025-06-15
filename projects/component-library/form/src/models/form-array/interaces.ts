import type { AC } from '../abstract-control/interfaces';
import type { Observable } from 'rxjs';
import type { ValidatorFns } from '../abstract-control/validation/interfaces';
import type { MetaFns } from '../abstract-control/meta/interfaces';
import type { Signal } from '@angular/core';
import type { FaRegisterFns } from './register/interfaces';
import type { FG } from '../form-group/interfaces';
import type { DeepPartial } from 'tableau-ui-angular/types';

export interface FA<T extends Record<string, unknown>> extends AC {
    controls$: Observable<FG<T>[]>;
    $controls: Signal<FG<T>[]>;
    value$: Observable<DeepPartial<T>[]>;
    $value: Signal<DeepPartial<T>[]>;
    rawValue$: Observable<T[]>;
    $rawValue: Signal<T[]>;
    submitted$: Observable<DeepPartial<T>[]>;
    reset$: Observable<DeepPartial<T>[]>;
    validatorFn: ValidatorFns<FA<T>>;
    metaFn: MetaFns<FA<T>>;
    registerFn: FaRegisterFns<T>;
    push: (
        control: FG<T>,
        options?: {
            emitEvent?: boolean;
        },
    ) => void;
    removeAt: (index: number, destroyControl: boolean, options?: { emitEvent?: boolean }) => void;
    insert: (
        index: number,
        control: FG<T>,
        options?: {
            emitEvent?: boolean;
        },
    ) => void;
    clear: (destroyControls: boolean, options?: { emitEvent?: boolean }) => void;
    at: (index: number) => FG<T> | undefined;


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
     reset: (value: T[], updateParentsValue?: boolean, emitEvent?: boolean) => void;
}
