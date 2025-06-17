import type { Observable } from 'rxjs';
import type { Hierarchy } from './hierarchy/interfaces';
import type { Signal } from '@angular/core';
import type { ValidatorFns } from './validation/interfaces';
import type { Meta, MetaFns } from './meta/interfaces';
import type { RegisterFns } from './register/interfaces';
import type { ReadonlyBehaviorSubject } from 'tableau-ui-angular/types';

export interface AC {
    readonly type: 'array' | 'control' | 'group';

    readonly meta$: ReadonlyBehaviorSubject<Meta>;
    readonly $meta: Signal<Meta>;
    /**
     * Checks if the control is invalid.
     * This is a promise as async validators may be involved.
     * @returns
     */
    isInvalid: () => Promise<boolean>;
    readonly value$: Observable<unknown>;
    readonly $value: Signal<unknown>;

    readonly submitted$: Observable<unknown>;
    readonly reset$: Observable<unknown>;

    readonly hierarchy: Hierarchy;
    readonly validatorFn: ValidatorFns;
    readonly metaFn: MetaFns;
    readonly registerFn: RegisterFns;

    /**
     * Recalculates the value and validation status of the control.
     * @param includeAncestors Also update the value and validity of ancestor controls.
     * @param includeDescendants Also update the value and validity of descendant controls.
     * @param markAsTouched If not provided or true, mark the control as touched.
     * @param markAsDirty If not provided or true, mark the control as dirty.
     * @param emitEvent If not provided or true, emits the valueChanges event after updating the value and validity.
     * @returns
     */
    updateValueAndValidity: (includeAncestors: boolean, includeDescendants: boolean, markAsTouched: boolean, markAsDirty: boolean, emitEvent?: boolean) => void;

    destroy: () => void;
}
