import { ValidatorFn, AsyncValidatorFn } from "@angular/forms";
import { FormReferencesOf } from "../types/form-references-of";
import { FormArrayReference } from "./form-array.reference";
import { FormControlReference } from "./form-control.reference";
import { FormGroupReference } from "./form-group.reference";
import { Primitive } from "../types/primitive";

export class ControlReferenceBuilder {
    control<T extends Primitive | Primitive[]>(
      value: T,
      validators?: ValidatorFn | ValidatorFn[],
      asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
      initialDisabled?: boolean,
      updateOn?: 'change' | 'blur' | 'submit'
    ): FormControlReference<T> {
      return new FormControlReference<T>({
        defaultValue: value,
        validators: validators,
        asyncValidators: asyncValidators,
        initialDisabled: initialDisabled,
        updateOn: updateOn,
      });
    }
    group<T extends Record<string, any>>(
      children: FormReferencesOf<T>,
      validators?: ValidatorFn | ValidatorFn[],
      asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
      updateOn?: 'change' | 'blur' | 'submit'
    ): FormGroupReference<T> {
      return new FormGroupReference<T>({
        children: children,
        validators: validators,
        asyncValidators: asyncValidators,
        updateOn: updateOn,
      });
    }
    array<TItem extends Record<string, any> | Primitive>(
      children: (TItem extends Record<string, any>
        ? FormGroupReference<TItem>
        : TItem extends Primitive | Primitive[]
        ? FormControlReference<TItem>
        : never)[],
      validators?: ValidatorFn | ValidatorFn[],
      asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
      updateOn?: 'change' | 'blur' | 'submit'
    ): FormArrayReference<TItem> {
      return new FormArrayReference<TItem>({
        children: children,
        validators: validators,
        asyncValidators: asyncValidators,
        updateOn: updateOn,
      });
    }
  }