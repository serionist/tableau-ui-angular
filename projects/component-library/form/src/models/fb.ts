/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormReferencesOf } from '../types/form-references-of';
import { Injectable } from '@angular/core';
import type { AsyncValidatorFn, ValidatorFn } from './abstract-control/validation/interfaces';
import type { FC } from './form-control/interfaces';
import { FCImpl } from './form-control/impl';
import type { FG } from './form-group/interfaces';
import { FGImpl } from './form-group/impl';
import type { FA } from './form-array/interaces';
import { FAImpl } from './form-array/impl';
import type { PrimitiveWithUndefined } from './form-control/types';

// eslint-disable-next-line @typescript-eslint/no-deprecated -- Angular 21 deprecates providedIn 'any'; replacing it changes which injector owns the service, so it waits for this service's own fix
@Injectable({
  providedIn: 'any',
})
export class FB {
  control<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]>(
    value: T,
    validators?: ValidatorFn | ValidatorFn[],
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
    initialDisabled?: boolean,
    updateOn?: 'blur' | 'change' | 'submit',
  ): FC<T> {
    return new FCImpl<T>({
      defaultValue: value,
      validators: validators,
      asyncValidators: asyncValidators,
      initialDisabled: initialDisabled,
      updateOn: updateOn,
    });
  }
  group<T extends Record<string, any>>(
    controls: FormReferencesOf<T>,
    validators?: ValidatorFn | ValidatorFn[],
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
    updateOn?: 'blur' | 'change' | 'submit',
  ): FG<T> {
    return new FGImpl<T>({
      controls: controls,
      validators: validators,
      asyncValidators: asyncValidators,
      updateOn: updateOn,
    });
  }
  array<TItem extends Record<string, any>>(
    controls: FG<TItem>[],
    validators?: ValidatorFn | ValidatorFn[],
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
    updateOn?: 'blur' | 'change' | 'submit',
  ): FA<TItem> {
    return new FAImpl<TItem>({
      controls: controls,
      validators: validators,
      asyncValidators: asyncValidators,
      updateOn: updateOn,
    });
  }
}
