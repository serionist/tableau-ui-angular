import { AsyncValidatorFn, FormControl, ValidatorFn } from "@angular/forms";
import { Primitive } from "../types/primitive";
import { AbstractControlTypedReference, IAbstractControlWithRef } from "./abstract-control.reference";
import { FormHelper } from "../form-helper";

export class FormControlReference<
  T extends Primitive | Primitive[]
> extends AbstractControlTypedReference<FormControlReference<T>> {
  override control: FormControl<T> & IAbstractControlWithRef;

  constructor(params: {
    defaultValue: T;
    initialDisabled?: boolean;
    validators?: ValidatorFn | ValidatorFn[];
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
    updateOn?: 'change' | 'blur' | 'submit';
  }) {
    super();
    const control: FormControl<T> = new FormControl<T>(
      { value: params.defaultValue, disabled: params.initialDisabled ?? false },
      {
        nonNullable: true,
        updateOn: params.updateOn,
        asyncValidators: params.asyncValidators,
        validators: params.validators,
      }
    );
    this.control = control as FormControl<T> & IAbstractControlWithRef;
    this.control.ref = this; // Assign the reference to the control

    this.modifyControlMethods();
  }

  registerChange(
    callback: (value: T) => void,
    run: (
      | 'onChange'
      | 'onAfterParentEnabled'
      | 'onAfterParentDisabled'
      | 'onAfterEnabled'
      | 'onAfterDisabled'
    )[] = ['onChange','onAfterEnabled'],
    onChangeParams: {
      fireInitial: boolean;
      onlyChanged: boolean;
    } = {
      fireInitial: true,
      onlyChanged: true,
    }
  ): FormControlReference<T> {
    if (run.includes('onChange')) {
      this.subscriptions.push(
        FormHelper.getValue$(
          this.control,
          onChangeParams.fireInitial,
          onChangeParams.onlyChanged
        ).subscribe((val) => callback(val as T))
      );
    }
    if (run.includes('onAfterParentEnabled')) {
      this.registerParentEnableChange((e) => {
        e === true ? callback(this.control.value as T) : () => {};
      });
    }
    if (run.includes('onAfterParentDisabled')) {
      this.registerParentEnableChange((e) => {
        e === false ? callback(this.control.value as T) : () => {};
      });
    }
    if (run.includes('onAfterEnabled')) {
      this.registerEnableChange((e) => {
        e === true ? callback(this.control.value as T) : () => {};
      });
    }
    if (run.includes('onAfterDisabled')) {
      this.registerEnableChange((e) => {
        e === false ? callback(this.control.value as T) : () => {};
      });
    }
    return this;
  }
}