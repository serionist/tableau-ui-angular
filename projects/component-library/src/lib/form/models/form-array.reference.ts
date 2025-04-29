import { FormArray, FormGroup, FormControl, ValidatorFn, AsyncValidatorFn } from "@angular/forms";
import { ControlsOf } from "../types/controls-of";
import { AbstractControlTypedReference, IAbstractControlWithRef } from "./abstract-control.reference";
import { FormControlReference } from "./form-control.reference";
import { FormGroupReference } from "./form-group.reference";
import { Primitive } from "../types/primitive";

export class FormArrayReference<
  TItem extends Record<string, any> | Primitive | Primitive[]
> extends AbstractControlTypedReference<FormArrayReference<TItem>> {
  override readonly control: FormArray<
    TItem extends Record<string, any>
      ? FormGroup<ControlsOf<TItem>>
      : FormControl<TItem>
  > &
    IAbstractControlWithRef;

  constructor(params: {
    children: (TItem extends Record<string, any>
      ? FormGroupReference<TItem>
      : TItem extends Primitive | Primitive[]
      ? FormControlReference<TItem>
      : never)[];
    validators?: ValidatorFn | ValidatorFn[];
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
    updateOn?: 'change' | 'blur' | 'submit';
  }) {
    super();

    const controlsArray = params.children.map((child) => child.control);

    const control = new FormArray(controlsArray, {
      validators: params.validators,
      asyncValidators: params.asyncValidators,
      updateOn: params.updateOn,
    }) as unknown as FormArray<
      TItem extends Record<string, any>
        ? FormGroup<ControlsOf<TItem>>
        : FormControl<TItem>
    >;
    this.control = control as FormArray<
      TItem extends Record<string, any>
        ? FormGroup<ControlsOf<TItem>>
        : FormControl<TItem>
    > &
      IAbstractControlWithRef;
    this.control.ref = this; // Assign the reference to the control

    this.childList = params.children.map((child) => child);

    this.modifyControlMethods();

    this.modifyFormMethods();
  }

  modifyFormMethods() {
    const originalPush = this.control.push.bind(this.control);
    const originalRemoveAt = this.control.removeAt.bind(this.control);
    const originalInsert = this.control.insert.bind(this.control);
    const originalClear = this.control.clear.bind(this.control);
    const originalSetControl = this.control.setControl.bind(this.control);

    const validateInputAndPrepareOp = (operation: string, control: TItem extends Record<string, any> ? FormGroup<ControlsOf<TItem>> & IAbstractControlWithRef : FormControl<TItem> & IAbstractControlWithRef,) => {
      if (!this.isCompatibleReference(control) || !control.ref) {
        throw new Error(
          `You can only ${operation} AbstractControls in the array that implement IAbstractControlWithRef -> have an AbstractControlReference`
        );
      }
      return {

      }
    };

    this.control.push = (
      control: TItem extends Record<string, any> ? FormGroup<ControlsOf<TItem>> & IAbstractControlWithRef : FormControl<TItem> & IAbstractControlWithRef,
      options?: {
        emitEvent?: boolean;
      }
    ) => {
      validateInputAndPrepareOp('push', control);
      // add them to the FormArray
      originalPush(control, options);
      // add them to childList
      this.childList.push(control.ref);
    };

    this.control.insert = (
      index: number,
      control: TItem extends Record<string, any> ? FormGroup<ControlsOf<TItem>> & IAbstractControlWithRef : FormControl<TItem> & IAbstractControlWithRef,
      options?: {
        emitEvent?: boolean;
      }
    ) => {
      validateInputAndPrepareOp('insert', control);
      // add them to the FormArray
      originalInsert(index, control, options);
      // add them to childList
      this.childList.splice(index, 0, control.ref);
    };
    this.control.removeAt = (
      index: number,
      options?: {
        emitEvent?: boolean;
      }
    ) => {
      originalRemoveAt(index, options);
      const child = this.childList[index];
      if (child) {
        child.destroy();
        this.childList.splice(index, 1);
      }
    };
    this.control.clear = (options?: { emitEvent?: boolean }) => {
      originalClear(options);
      this.childList.forEach((child) => {
        child.destroy();
      });
      this.childList = [];
    };
    this.control.setControl = (
      index: number,
      control: TItem extends Record<string, any> ? FormGroup<ControlsOf<TItem>> & IAbstractControlWithRef : FormControl<TItem> & IAbstractControlWithRef,
      options?: { emitEvent?: boolean }
    ) => {
      validateInputAndPrepareOp('setControl', control);
      originalSetControl(index, control, options);
      this.childList[index] = control.ref;
    };
  }

  isCompatibleReference(control: any): control is IAbstractControlWithRef {
    if (control.ref) {
      return true;
    }
    return false;
  }

  // registerRootChange(
  //   callback: (value: DeepPartial<TItem>[]) => void,
  //   fireInitial = true,
  //   onlyChanged = true
  // ): FormArrayReference<TItem> {
  //   this.subscriptions.push(
  //     FormHelper.getComplexValue$(
  //       this.control,
  //       fireInitial,
  //       onlyChanged
  //     ).subscribe((val) => callback(val as DeepPartial<TItem>[]))
  //   );
  //   return this;
  // }

  // registerChildControlChange<T extends Primitive>(
  //   formControlSelector: (array: FormArray<any>) => FormControl<T>,
  //   callback: (value: T) => void,
  //   fireInitial = true,
  //   onlyChanged = true
  // ): FormArrayReference<TItem> {
  //   this.subscriptions.push(
  //     FormHelper.getValue$(
  //       formControlSelector(this.control),
  //       fireInitial,
  //       onlyChanged
  //     ).subscribe((val) => callback(val as T))
  //   );
  //   return this;
  // }
}