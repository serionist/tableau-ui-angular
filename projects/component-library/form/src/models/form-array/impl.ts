import type { Signal, WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, filter, map, startWith } from 'rxjs';
import { ACImpl } from '../abstract-control/impl';
import { InTurnSubject } from '../abstract-control/in-turn';
import type { MetaFns } from '../abstract-control/meta/interfaces';
import type { AsyncValidatorFn, ValidatorFn, ValidatorFns } from '../abstract-control/validation/interfaces';
import type { FA } from './interaces';
import { FaRegisterFnsImpl } from './register/impl';
import type { FG } from '../form-group/interfaces';
import type { FormGroup } from '@angular/forms';
import { FormArray, FormResetEvent, FormSubmittedEvent } from '@angular/forms';
import type { ControlsOf } from '../../types/controls-of';
import { ValidatorFnsImpl } from '../abstract-control/validation/impl';
import { MetaFnsImpl } from '../abstract-control/meta/impl';
import type { FGImpl } from '../form-group/impl';
import type { DeepPartial, ReadonlyBehaviorSubject } from 'tableau-ui-angular/types';

export class FAImpl<T extends Record<string, unknown>> extends ACImpl<T[]> implements FA<T> {
  protected readonly $_value: WritableSignal<DeepPartial<T>[]>;
  protected readonly _value$: InTurnSubject<DeepPartial<T>[]>;
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

    // a copy, so the rows the caller passed in stay theirs
    super('array', control, [...params.controls]);
    this._control = control;
    this._defaultValue = control.getRawValue() as T[];

    this.$_controls = signal(this._controls$.value);

    this._value$ = new InTurnSubject<DeepPartial<T>[]>(control.value, control);
    this.$_value = signal(control.value);
    this._rawValue$ = new BehaviorSubject<T[]>(this._defaultValue);
    this.$_rawValue = signal<T[]>(this._rawValue$.value);
    // A change a subscriber makes reaches value$, $value and the raw value once every subscriber has the current value;
    // push, insert, removeAt and clear change the raw value and $controls at once, while $value waits
    this.subscriptions.push(
      control.valueChanges.pipe(startWith(control.value)).subscribe(v => {
        this._value$.next(v);
      }),
    );
    // The raw value changes with an edit as well as with the rows, as the group's does
    this.subscriptions.push(
      this._value$.subscribe(v => {
        this.$_value.set(v);
        this.refreshRawValue();
      }),
    );
    this.subscriptions.push(
      this._controls$.subscribe(v => {
        this.$_controls.set(v);
      }),
    );
    this.submitted$ = this.control.events.pipe(
      filter(e => e instanceof FormSubmittedEvent),
      map(() => this._value$.latest),
    );
    this.reset$ = this.control.events.pipe(
      filter(e => e instanceof FormResetEvent),
      map(() => this._value$.latest),
    );
    this.registerFn = new FaRegisterFnsImpl<T>(this, this.subscriptions);
    this.validatorFn = new ValidatorFnsImpl<FA<T>>(this.control, this);
    this.metaFn = new MetaFnsImpl<FA<T>>(this.control, this);
    this.refreshMeta();
  }

  private get formArray() {
    return this.control as FormArray<FormGroup<ControlsOf<T>>>;
  }
  private refreshRawValue() {
    const rawValue = this.control.getRawValue() as T[];
    this.$_rawValue.set(rawValue);
    this._rawValue$.next(rawValue);
  }
  // push, insert and removeAt change the child list first, as a new list so the signals over it notify, and then the
  // FormArray, whose event then reaches valueChange with the rows its value holds. The raw value and the metas, the
  // array's and its ancestors', follow the FormArray even when it emits nothing. The removed rows are destroyed before
  // the metas refresh, which throws to the caller when a meta rule doesn't settle (InTurn).
  push(
    control: FG<T>,
    options?: {
      emitEvent?: boolean;
    },
  ) {
    const c = (control as FGImpl<T>).control;
    this.hierarchy.childList$.next([...this.hierarchy.childList$.value, control]);
    this.formArray.push(c as FormGroup<ControlsOf<T>>, options);
    this.refreshRawValue();
    this.refreshMetaUpwards();
  }

  removeAt(index: number, destroyControl: boolean, options?: { emitEvent?: boolean }) {
    const childList = this.hierarchy.childList$.value;
    // a negative index counts from the end, as FormArray's does
    const at = index < 0 ? index + childList.length : index;
    const control = childList[at];
    this.hierarchy.childList$.next(childList.filter((_, i) => i !== at));
    this.formArray.removeAt(index, options);
    this.refreshRawValue();
    if (control !== undefined && destroyControl) {
      control.destroy();
    }
    this.refreshMetaUpwards();
  }
  insert(
    index: number,
    control: FG<T>,
    options?: {
      emitEvent?: boolean;
    },
  ) {
    const c = (control as FGImpl<T>).control;

    const childList = this.hierarchy.childList$.value;
    this.hierarchy.childList$.next([...childList.slice(0, index), control, ...childList.slice(index)]);
    this.formArray.insert(index, c as FormGroup<ControlsOf<T>>, options);
    this.refreshRawValue();
    this.refreshMetaUpwards();
  }
  clear(destroyControls: boolean, options?: { emitEvent?: boolean }) {
    const childList = this.hierarchy.childList$.value;
    this.hierarchy.childList$.next([]);
    this.formArray.clear(options);
    this.refreshRawValue();
    if (destroyControls) {
      childList.forEach(child => {
        child.destroy();
      });
    }
    this.refreshMetaUpwards();
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
