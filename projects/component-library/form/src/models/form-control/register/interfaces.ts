
import type { Primitive } from 'tableau-ui-angular/types';
import type { RegisterFns } from '../../abstract-control/register/interfaces';
import type { FC } from '../interfaces';

export interface FcRegisterFns<T extends Primitive | Primitive[]> extends RegisterFns<FC<T>> {
    /**
     * Registers a callback to be called when the value of the control changes.
     * The callback is always called initially.
     * @param callback
     * @param alsoRunOnEnabled Whether to also run the callback when the control is enabled.
     * @param alsoRunOnDisabled Whether to also run the callback when the control is disabled.
     */
    valueChange: (callback: (value: T, oldValue: T | undefined, control: FC<T>) => void, alsoRunOnEnabled?: boolean, alsoRunOnDisabled?: boolean) => FC<T>;
}
