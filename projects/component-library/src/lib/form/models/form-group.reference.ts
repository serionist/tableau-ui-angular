import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { AbstractControlReference, AbstractControlTypedReference, IAbstractControlWithRef } from "./abstract-control.reference";
import { ControlsOf } from "../types/controls-of";
import { FormReferencesOf } from "../types/form-references-of";
import { FormControlReference } from "./form-control.reference";
import { FormHelper } from "../form-helper";
import { Primitive } from "../types/primitive";

export class FormGroupReference<
  TSource extends Record<string, any>
> extends AbstractControlTypedReference<FormGroupReference<TSource>> {
  override readonly control: FormGroup<ControlsOf<TSource>> &
    IAbstractControlWithRef;

  readonly children: FormReferencesOf<TSource>;
  constructor(params: {
    children: FormReferencesOf<TSource>;
    validators?: ValidatorFn | ValidatorFn[];
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
    updateOn?: 'change' | 'blur' | 'submit';
  }) {
    super();
    this.children = params.children;

    const a: Record<string, AbstractControlReference> = params.children;
    const aRef: Record<string, AbstractControl> = {};
    Object.keys(a).forEach((key) => {
      aRef[key] = (a[key] as AbstractControlReference).control;
    });

    const controls = Object.entries(params.children).reduce(
      (acc, [key, child]) => {
        acc[key as keyof TSource] = child['control']; // Bracket access for protected fields
        return acc;
      },
      {} as Partial<ControlsOf<TSource>>
    );

    const control = new FormGroup<ControlsOf<TSource>>(
      controls as ControlsOf<TSource>,
      {
        validators: params.validators,
        asyncValidators: params.asyncValidators,
        updateOn: params.updateOn,
      }
    );
    this.control = control as FormGroup<ControlsOf<TSource>> &
      IAbstractControlWithRef;
    this.control.ref = this; // Assign the reference to the control

    this.childList = Object.entries(params.children).map(
      ([key, child]) => child
    );

    this.modifyControlMethods();
  }

  registerRootChange(
    callback: (value: Partial<TSource>) => void,
    run: (
      | 'onChange'
      | 'onAfterParentEnabled'
      | 'onAfterParentDisabled'
      | 'onAfterEnabled'
      | 'onAfterDisabled'
    )[] = ['onChange', 'onAfterParentEnabled', 'onAfterEnabled'],
    onChangeParams: {
      fireInitial: boolean;
      onlyChanged: boolean;
    } = {
      fireInitial: true,
      onlyChanged: true,
    }
  ): FormGroupReference<TSource> {
    if (run.includes('onChange')) {
      this.subscriptions.push(
        FormHelper.getComplexValue$(
          this.control,
          onChangeParams.fireInitial,
          onChangeParams.onlyChanged
        ).subscribe((val) => callback(val as Partial<TSource>))
      );
    }
    if (run.includes('onAfterParentEnabled')) {
      this.registerParentEnableChange((b) => {
        b === true
          ? callback(this.control.getRawValue() as Partial<TSource>)
          : () => {};
      });
    }
    if (run.includes('onAfterParentDisabled')) {
      this.registerParentEnableChange((b) => {
        b === false
          ? callback(this.control.getRawValue() as Partial<TSource>)
          : () => {};
      });
    }
    if (run.includes('onAfterEnabled')) {
      this.registerEnableChange((b) => {
        b === true
          ? callback(this.control.getRawValue() as Partial<TSource>)
          : () => {};
      });
    }
    if (run.includes('onAfterDisabled')) {
      this.registerEnableChange((b) => {
        b === false
          ? callback(this.control.getRawValue() as Partial<TSource>)
          : () => {};
      });
    }
    return this;
  }

  registerChildControlChange<T extends Primitive | Primitive[]>(
    formControlSelector: (
      children: FormReferencesOf<TSource>
    ) => FormControlReference<T>,
    callback: (
      control: FormControl<T>,
      group: FormGroup<ControlsOf<TSource>>,
      value: T
    ) => void,
    run: (
      | 'onChange'
      | 'onAfterParentEnabled'
      | 'onAfterParentDisabled'
      | 'onAfterEnabled'
      | 'onAfterDisabled'
    )[] = ['onChange', 'onAfterParentEnabled', 'onAfterEnabled'],
    onChangeParams: {
      fireInitial: boolean;
      onlyChanged: boolean;
    } = {
      fireInitial: true,
      onlyChanged: true,
    }
  ): FormGroupReference<TSource> {
    const ctrl = formControlSelector(this.children).control;
    if (run.includes('onChange')) {
      this.subscriptions.push(
        FormHelper.getValue$(
          ctrl,
          onChangeParams.fireInitial,
          onChangeParams.onlyChanged
        ).subscribe((val) => callback(ctrl, this.control, val as T))
      );
    }
    if (run.includes('onAfterParentEnabled')) {
      this.registerParentEnableChange((b) => {
        b === true ? callback(ctrl, this.control, ctrl.value as T) : () => {};
      });
    }
    if (run.includes('onAfterParentDisabled')) {
      this.registerParentEnableChange((b) => {
        b === false ? callback(ctrl, this.control, ctrl.value as T) : () => {};
      });
    }
    if (run.includes('onAfterEnabled')) {
      this.registerEnableChange((b) => {
        b === true ? callback(ctrl, this.control, ctrl.value as T) : () => {};
      });
    }
    if (run.includes('onAfterDisabled')) {
      this.registerEnableChange((b) => {
        b === false ? callback(ctrl, this.control, ctrl.value as T) : () => {};
      });
    }
    return this;
  }

  registerChildGroupChange<T extends Record<string, any>>(
    formControlSelector: (
      children: FormReferencesOf<TSource>
    ) => FormGroupReference<T>,
    callback: (value: Partial<T>) => void,
    run: (
      | 'onChange'
      | 'onAfterParentEnabled'
      | 'onAfterParentDisabled'
      | 'onAfterEnabled'
      | 'onAfterDisabled'
    )[] = ['onChange', 'onAfterParentEnabled', 'onAfterEnabled'],
    onChangeParams: {
      fireInitial: boolean;
      onlyChanged: boolean;
    } = {
      fireInitial: true,
      onlyChanged: true,
    }
  ): FormGroupReference<TSource> {
    const control = formControlSelector(this.children).control;
    if (run.includes('onChange')) {
      this.subscriptions.push(
        FormHelper.getComplexValue$(
          control,
          onChangeParams.fireInitial,
          onChangeParams.onlyChanged
        ).subscribe((val) => callback(val as Partial<T>))
      );
    }
    if (run.includes('onAfterParentEnabled')) {
      this.registerParentEnableChange((b) => {
        b === true ? callback(control.getRawValue() as Partial<T>) : () => {};
      });
    }
    if (run.includes('onAfterParentDisabled')) {
      this.registerParentEnableChange((b) => {
        b === false ? callback(control.getRawValue() as Partial<T>) : () => {};
      });
    }
    if (run.includes('onAfterEnabled')) {
      this.registerEnableChange((b) => {
        b === true ? callback(control.getRawValue() as Partial<T>) : () => {};
      });
    }
    if (run.includes('onAfterDisabled')) {
      this.registerEnableChange((b) => {
        b === false ? callback(control.getRawValue() as Partial<T>) : () => {};
      });
    }
    return this;
  }
}