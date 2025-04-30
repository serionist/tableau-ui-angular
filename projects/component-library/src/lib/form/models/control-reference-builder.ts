import { ValidatorFn, AsyncValidatorFn } from "@angular/forms";
import { FormReferencesOf } from "../types/form-references-of";
import { Primitive } from "../types/primitive";
import { FC } from "./form-control.reference";
import { FG } from "./form-group.reference";
import { FA } from "./form-array.reference";

export class ControlReferenceBuilder {
    control<T extends Primitive | Primitive[]>(
      value: T,
      validators?: ValidatorFn | ValidatorFn[],
      asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
      initialDisabled?: boolean,
      updateOn?: 'change' | 'blur' | 'submit'
    ): FC<T> {
      return new FC<T>({
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
      updateOn?: 'change' | 'blur' | 'submit'
    ): FG<T> {
      return new FG<T>({
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
      updateOn?: 'change' | 'blur' | 'submit'
    ): FA<TItem> {
      return new FA<TItem>({
        controls: controls,
        validators: validators,
        asyncValidators: asyncValidators,
        updateOn: updateOn,
      });
    }
  }