import type { Signal, WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, filter, map, startWith } from 'rxjs';
import { ACImpl } from '../abstract-control/impl';
import type { MetaFns } from '../abstract-control/meta/interfaces';
import type { AsyncValidatorFn, ValidatorFn, ValidatorFns } from '../abstract-control/validation/interfaces';
import type { FA } from './interaces';
import { FaRegisterFnsImpl } from './register/impl';
import type { FG } from '../form-group/interfaces';
import type { FormGroup } from '@angular/forms';
import { FormArray, FormResetEvent } from '@angular/forms';
import type { ControlsOf } from '../../types/controls-of';
import { ValidatorFnsImpl } from '../abstract-control/validation/impl';
import { MetaFnsImpl } from '../abstract-control/meta/impl';
import type { FGImpl } from '../form-group/impl';
import type { DeepPartial, ReadonlyBehaviorSubject } from 'tableau-ui-angular/types';

export class FAImpl<T extends Record<string, unknown>> extends ACImpl<T[]> implements FA<T> {
  protected readonly $_value: WritableSignal<DeepPartial<T>[]>;
  protected readonly _value$: BehaviorSubject<DeepPartial<T>[]>;
  private readonly _rawValue$: BehaviorSubject<T[]>;
  private readonly $_rawValue: WritableSignal<T[]>;
  public override get value$(): Observable<DeepPartial<T>[]> {
    return this._value$.asObservable();
  }
  public override get $value(): Signal<DeepPartial<T>[]> {
    return this.$_value;
  }
  public get rawValue$(): Observable<T[]> {
    return this._rawValue$.asObservable();
  }
  public get $rawValue(): Signal<T[]> {
    return this.$_rawValue;
  }
  private get _controls$(): ReadonlyBehaviorSubject<FG<T>[]> {
    return this.hierarchy.childList$ as unknown as ReadonlyBehaviorSubject<FG<T>[]>;
  }
  get controls$(): Observable<FG<T>[]> {
    return this._controls$;
  }
  private readonly $_controls: WritableSignal<FG<T>[]>;
  get $controls(): Signal<FG<T>[]> {
    return this.$_controls;
  }

  public override submitted$: Observable<DeepPartial<T>[]>;
  public override reset$: Observable<DeepPartial<T>[]>;
  public override validatorFn: ValidatorFns<FA<T>>;
  public override metaFn: MetaFns<FA<T>>;
  public override registerFn: FaRegisterFnsImpl<T>;

  private readonly _control: FormArray<FormGroup<ControlsOf<T>>>;
  private readonly _defaultValue: T[];
  public override get defaultValue(): T[] {
    return this._defaultValue;
  }
  constructor(params: { controls: FG<T>[]; validators?: ValidatorFn | ValidatorFn[]; asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[]; updateOn?: 'blur' | 'change' | 'submit' }) {
    const controlsArray = params.controls.map(child => {
      const c = (child as unknown as ACImpl<unknown>).control;
      return c as FormGroup<ControlsOf<T>>;
    });

    const control = new FormArray(controlsArray, {
      validators: params.validators,
      asyncValidators: params.asyncValidators,
      updateOn: params.updateOn,
    });

    super('array', control, params.controls);
    this._control = control;
    this._defaultValue = control.getRawValue() as T[];

    this.$_controls = signal(this._controls$.value);

    this._value$ = new BehaviorSubject<DeepPartial<T>[]>(control.value);
    this.$_value = signal(control.value);
    this._rawValue$ = new BehaviorSubject<T[]>(this._defaultValue);
    this.$_rawValue = signal<T[]>(this._rawValue$.value);
    this.subscriptions.push(
      control.valueChanges.pipe(startWith(control.value)).subscribe(v => {
        this._value$.next(v);
      }),
    );
    this.subscriptions.push(
      this._value$.subscribe(v => {
        this.$_value.set(v);
      }),
    );
    this.subscriptions.push(
      this._controls$.subscribe(v => {
        this.$_controls.set(v);
        const rawValue = control.getRawValue() as T[];
        this._rawValue$.next(rawValue);
        this.$_rawValue.set(rawValue);
      }),
    );
    this.submitted$ = this.control.events.pipe(
      filter(e => e instanceof SubmitEvent),
      map(() => this._value$.value),
    );
    this.reset$ = this.control.events.pipe(
      filter(e => e instanceof FormResetEvent),
      map(() => this._value$.value),
    );
    this.registerFn = new FaRegisterFnsImpl<T>(this, this.subscriptions);
    this.validatorFn = new ValidatorFnsImpl<FA<T>>(this.control);
    this.metaFn = new MetaFnsImpl<FA<T>>(this.control, this);
  }

  private get formArray() {
    return this.control as FormArray<FormGroup<ControlsOf<T>>>;
  }
  push(
    control: FG<T>,
    options?: {
      emitEvent?: boolean;
    },
  ) {
    const c = (control as FGImpl<T>).control;
    this.formArray.push(c as FormGroup<ControlsOf<T>>, options);
    const childList = this.hierarchy.childList$.value;
    childList.push(control);
    this.hierarchy.childList$.next(childList);
  }

  removeAt(index: number, destroyControl: boolean, options?: { emitEvent?: boolean }) {
    this.formArray.removeAt(index, options);
    const childList = this.hierarchy.childList$.value;
    const control = childList.splice(index, 1)[0];
    if (control !== undefined && destroyControl) {
      control.destroy();
    }
    this.hierarchy.childList$.next(childList);
  }
  insert(
    index: number,
    control: FG<T>,
    options?: {
      emitEvent?: boolean;
    },
  ) {
    const c = (control as FGImpl<T>).control;

    this.formArray.insert(index, c as FormGroup<ControlsOf<T>>, options);
    const childList = this.hierarchy.childList$.value;
    childList.splice(index, 0, control);
    this.hierarchy.childList$.next(childList);
  }
  clear(destroyControls: boolean, options?: { emitEvent?: boolean }) {
    this.formArray.clear(options);
    const childList = this.hierarchy.childList$.value;
    if (destroyControls) {
      childList.forEach(child => {
        child.destroy();
      });
    }
    this.hierarchy.childList$.next([]);
  }
  at(index: number): FG<T> | undefined {
    return this._controls$.value[index];
  }

  resetWithDefaultValue(updateParentsValue: boolean = true, emitEvent: boolean = true) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    this._control.reset(this._defaultValue as any, { onlySelf: !updateParentsValue, emitEvent: emitEvent });
  }
  reset(value: T[], updateParentsValue: boolean = true, emitEvent: boolean = true) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    this._control.reset(value as any, { onlySelf: !updateParentsValue, emitEvent: emitEvent });
  }
}
