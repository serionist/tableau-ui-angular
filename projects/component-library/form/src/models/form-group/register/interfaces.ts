
import type { DeepPartial, Primitive } from 'tableau-ui-angular/types';
import type { FormReferencesOf } from '../../../types/form-references-of';
import type { RegisterFns } from '../../abstract-control/register/interfaces';
import type { FC } from '../../form-control/interfaces';
import type { FG } from '../interfaces';

export interface FgRegisterFns<TSource extends Record<string, unknown>> extends RegisterFns<FG<TSource>> {
    /**
     * Registers a callback to be called when the value of the group changes.
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    valueChange: (callback: (value: DeepPartial<TSource>, oldValue: DeepPartial<TSource> | undefined, control: FG<TSource>) => void, alsoRunOnEnabled?: boolean, alsoRunOnDisabled?: boolean) => FG<TSource>;
    /**
     * Registers a callback to be called when the value of a child control changes
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    childChange: <T extends Primitive | Primitive[]>(
        formControlSelector: (children: FormReferencesOf<TSource>) => FC<T>,
        callback: (group: FG<TSource>, control: FC<T>, value: T) => void,
        alsoRunOnEnabled?: boolean,
        alsoRunOnDisabled?: boolean,
    ) => FG<TSource>;

    /**
     * Registers a callback to be called when the value of a child group changes
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    childGroupChange: <T extends Record<string, unknown>>(
        formControlSelector: (children: FormReferencesOf<TSource>) => FG<T>,
        callback: (group: FG<TSource>, control: FG<T>, value: DeepPartial<T>) => void,
        alsoRunOnEnabled?: boolean,
        alsoRunOnDisabled?: boolean,
    ) => FG<TSource>;
}
