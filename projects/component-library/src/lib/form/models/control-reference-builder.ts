/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import type { FormReferencesOf } from '../types/form-references-of';
import type { Primitive } from '../../common/types/primitive';
import { FC } from './form-control.reference';
import { FG } from './form-group.reference';
import { FA } from './form-array.reference';
import { Injectable } from '@angular/core';
import { TableauUiFormModule } from '../tableau-ui-form.module';

@Injectable({
    providedIn: TableauUiFormModule,
})
export class ControlReferenceBuilder {
    control<T extends Primitive | Primitive[]>(
        value: T,
        validators?: ValidatorFn | ValidatorFn[],
        asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
        initialDisabled?: boolean,
        updateOn?: 'change' | 'blur' | 'submit',
    ): FC<T> {
        return new FC<T>({
            defaultValue: value,
            validators: validators,
            asyncValidators: asyncValidators,
            initialDisabled: initialDisabled,
            updateOn: updateOn,
        });
    }
    group<T extends Record<string, any>>(controls: FormReferencesOf<T>, validators?: ValidatorFn | ValidatorFn[], asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[], updateOn?: 'change' | 'blur' | 'submit'): FG<T> {
        return new FG<T>({
            controls: controls,
            validators: validators,
            asyncValidators: asyncValidators,
            updateOn: updateOn,
        });
    }
    array<TItem extends Record<string, any>>(controls: FG<TItem>[], validators?: ValidatorFn | ValidatorFn[], asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[], updateOn?: 'change' | 'blur' | 'submit'): FA<TItem> {
        return new FA<TItem>({
            controls: controls,
            validators: validators,
            asyncValidators: asyncValidators,
            updateOn: updateOn,
        });
    }
}
