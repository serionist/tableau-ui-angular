import type { DeepPartial } from '../../types/deep-partial';
import type { AC } from '../abstract-control/interfaces';
import type { Observable } from 'rxjs';
import type { ValidatorFns } from '../abstract-control/validation/interfaces';
import type { MetaFns } from '../abstract-control/meta/interfaces';
import type { Signal } from '@angular/core';
import { RegisterFns } from '../abstract-control/register/interfaces';
import type { FaRegisterFns } from './register/interfaces';
import type { FG } from '../form-group/interfaces';

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

    
}
