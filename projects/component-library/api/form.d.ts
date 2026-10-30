// The public API of tableau-ui-angular/form, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i12 from '@angular/common';
import * as i0 from '@angular/core';
import { DestroyRef, PipeTransform, Signal } from '@angular/core';
import * as i11 from '@angular/forms';
import { AbstractControl, FormArray, FormControl, FormControlStatus, FormGroup, ValidationErrors as ValidationErrors$1 } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeepPartial, Primitive, ReadonlyBehaviorSubject } from 'tableau-ui-angular/types';

interface AC {
  readonly type: 'array' | 'control' | 'group';
  readonly meta$: ReadonlyBehaviorSubject<Meta>;
  readonly $meta: Signal<Meta>;
  isInvalid: () => Promise<boolean>;
  readonly value$: Observable<unknown>;
  readonly $value: Signal<unknown>;
  readonly defaultValue: unknown;
  readonly submitted$: Observable<unknown>;
  readonly reset$: Observable<unknown>;
  readonly hierarchy: Hierarchy;
  readonly validatorFn: ValidatorFns;
  readonly metaFn: MetaFns;
  readonly registerFn: RegisterFns;
  updateValueAndValidity: (includeAncestors: boolean, includeDescendants: boolean, markAsTouched: boolean, markAsDirty: boolean, emitEvent?: boolean) => void;
  destroy: () => void;
}

type AsyncValidatorFn = (control: AbstractControl) => Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;

type ControlsOf<T extends Record<string, any>> = {
  [K in keyof T]-?: NonNullable<T[K]> extends Array<infer U>
    ? U extends Record<string, any>
      ? Extract<T, undefined> | FormArray<Extract<U, undefined> | FormGroup<ControlsOf<NonNullable<U>>>>
      : FormControl<T[K]>
    : NonNullable<T[K]> extends Date
      ? FormControl<T[K]>
      : NonNullable<T[K]> extends Record<string, any>
        ? FormGroup<ControlsOf<NonNullable<T[K]>>> | Extract<T, undefined>
        : FormControl<T[K]>;
};

interface FA<T extends Record<string, unknown>> extends AC {
  controls$: Observable<FG<T>[]>;
  $controls: Signal<FG<T>[]>;
  value$: Observable<DeepPartial<T>[]>;
  $value: Signal<DeepPartial<T>[]>;
  rawValue$: Observable<T[]>;
  $rawValue: Signal<T[]>;
  submitted$: Observable<DeepPartial<T>[]>;
  reset$: Observable<DeepPartial<T>[]>;
  validatorFn: ValidatorFns<FA<T>>;
  metaFn: MetaFns<FA<T>>;
  registerFn: FaRegisterFns<T>;
  push: (
    control: FG<T>,
    options?: {
      emitEvent?: boolean;
    },
  ) => void;
  removeAt: (
    index: number,
    destroyControl: boolean,
    options?: {
      emitEvent?: boolean;
    },
  ) => void;
  insert: (
    index: number,
    control: FG<T>,
    options?: {
      emitEvent?: boolean;
    },
  ) => void;
  clear: (
    destroyControls: boolean,
    options?: {
      emitEvent?: boolean;
    },
  ) => void;
  at: (index: number) => FG<T> | undefined;
  resetWithDefaultValue: (updateParentsValue?: boolean, emitEvent?: boolean) => void;
  reset: (value: T[], updateParentsValue?: boolean, emitEvent?: boolean) => void;
}

export declare class FB {
  control<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]>(
    value: T,
    validators?: ValidatorFn | ValidatorFn[],
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
    initialDisabled?: boolean,
    updateOn?: 'blur' | 'change' | 'submit',
  ): FC<T>;
  group<T extends Record<string, any>>(
    controls: FormReferencesOf<T>,
    validators?: ValidatorFn | ValidatorFn[],
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
    updateOn?: 'blur' | 'change' | 'submit',
  ): FG<T>;
  array<TItem extends Record<string, any>>(
    controls: FG<TItem>[],
    validators?: ValidatorFn | ValidatorFn[],
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[],
    updateOn?: 'blur' | 'change' | 'submit',
  ): FA<TItem>;
  static ɵfac: i0.ɵɵFactoryDeclaration<FB, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}

interface FC<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]> extends AC {
  value$: Observable<T>;
  $value: Signal<T>;
  submitted$: Observable<T>;
  reset$: Observable<T>;
  validatorFn: ValidatorFns<FC<T>>;
  metaFn: MetaFns<FC<T>>;
  registerFn: FcRegisterFns<T>;
  setValue: (
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    },
  ) => void;
  resetWithDefaultValue: (updateParentsValue?: boolean, emitEvent?: boolean) => void;
  reset: (value: T, updateParentsValue?: boolean, emitEvent?: boolean) => void;
}

interface FG<T extends Record<string, unknown>> extends AC {
  readonly controls: FormReferencesOf<T>;
  value$: Observable<DeepPartial<T>>;
  $value: Signal<DeepPartial<T>>;
  rawValue$: Observable<T>;
  $rawValue: Signal<T>;
  submitted$: Observable<DeepPartial<T>>;
  reset$: Observable<DeepPartial<T>>;
  validatorFn: ValidatorFns<FG<T>>;
  metaFn: MetaFns<FG<T>>;
  registerFn: FgRegisterFns<T>;
  setValue: (
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    },
  ) => void;
  resetWithDefaultValue: (updateParentsValue?: boolean, emitEvent?: boolean) => void;
  reset: (value: T, updateParentsValue?: boolean, emitEvent?: boolean) => void;
}

interface FaRegisterFns<TItem extends Record<string, unknown>> extends RegisterFns<FA<TItem>> {
  valueChange: (
    callback: (value: DeepPartial<TItem>[], oldValue: DeepPartial<TItem>[] | undefined, controls: FG<TItem>[], control: FA<TItem>) => void,
    alsoRunOnEnabled?: boolean,
    alsoRunOnDisabled?: boolean,
    destroyRef?: DestroyRef,
  ) => FA<TItem>;
}

interface FcRegisterFns<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]> extends RegisterFns<FC<T>> {
  valueChange: (callback: (value: T, oldValue: T | undefined, control: FC<T>) => void, alsoRunOnEnabled?: boolean, alsoRunOnDisabled?: boolean, destroyRef?: DestroyRef) => FC<T>;
}

interface FgRegisterFns<TSource extends Record<string, unknown>> extends RegisterFns<FG<TSource>> {
  valueChange: (
    callback: (value: DeepPartial<TSource>, oldValue: DeepPartial<TSource> | undefined, control: FG<TSource>) => void,
    alsoRunOnEnabled?: boolean,
    alsoRunOnDisabled?: boolean,
    destroyRef?: DestroyRef,
  ) => FG<TSource>;
  childChange: <T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]>(
    formControlSelector: (children: FormReferencesOf<TSource>) => FC<T>,
    callback: (group: FG<TSource>, control: FC<T>, value: T) => void,
    alsoRunOnEnabled?: boolean,
    alsoRunOnDisabled?: boolean,
    destroyRef?: DestroyRef,
  ) => FG<TSource>;
  childGroupChange: <T extends Record<string, unknown>>(
    formControlSelector: (children: FormReferencesOf<TSource>) => FG<T>,
    callback: (group: FG<TSource>, control: FG<T>, value: DeepPartial<T>) => void,
    alsoRunOnEnabled?: boolean,
    alsoRunOnDisabled?: boolean,
    destroyRef?: DestroyRef,
  ) => FG<TSource>;
}

export declare class FormArrayControlsPipe implements PipeTransform {
  transform<T extends Record<string, any>>(form: FA<T>): Observable<FG<T>[]>;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormArrayControlsPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormArrayControlsPipe, 'formArrayControls', false>;
}

export declare class FormArrayPipe implements PipeTransform {
  transform(form: AC, path?: string): FormArray;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormArrayPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormArrayPipe, 'formArray', false>;
}

export declare class FormArrayValuePipe implements PipeTransform {
  transform<TKind extends 'standard' | 'raw' = 'standard', TItem extends Record<string, any> = any>(
    formRef: FA<TItem> | null | undefined,
    kind?: TKind,
  ): Observable<TKind extends 'standard' ? DeepPartial<TItem[]> : TItem[]>;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormArrayValuePipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormArrayValuePipe, 'formArrayValue', false>;
}

export declare class FormControlPipe implements PipeTransform {
  transform(form: AC, path?: string): FormControl;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormControlPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormControlPipe, 'formControl', false>;
}

export declare class FormControlValuePipe implements PipeTransform {
  transform<T extends PrimitiveWithUndefined | PrimitiveWithUndefined[]>(group: FC<T> | null | undefined): import('rxjs').Observable<T>;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormControlValuePipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormControlValuePipe, 'formControlValue', false>;
}

export declare class FormErrorPipe implements PipeTransform {
  transform(meta: Meta | null | undefined, specificError: string, requireTouched?: boolean, log?: boolean): Primitive;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormErrorPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormErrorPipe, 'formError', false>;
}

export declare class FormGroupPipe implements PipeTransform {
  transform(form: AC, path?: string): FormGroup;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormGroupPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormGroupPipe, 'formGroup', false>;
}

export declare class FormGroupValuePipe implements PipeTransform {
  transform<TKind extends 'standard' | 'raw' = 'standard', T extends Record<string, any> = any>(
    group: FG<T> | null | undefined,
    kind?: TKind,
  ): Observable<TKind extends 'standard' ? DeepPartial<T> : T>;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormGroupValuePipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormGroupValuePipe, 'formGroupValue', false>;
}

export declare class FormHasErrorPipe implements PipeTransform {
  transform(meta: Meta | null | undefined, specificError?: string, requireTouched?: boolean, log?: boolean): boolean;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormHasErrorPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormHasErrorPipe, 'formHasError', false>;
}

export declare class FormMetaPipe implements PipeTransform {
  transform(form: AC | null | undefined, path?: string): Observable<Meta | null>;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormMetaPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<FormMetaPipe, 'formMeta', false>;
}

type FormReferencesOf<T extends Record<string, any>> = {
  [K in keyof T]-?: NonNullable<T[K]> extends (infer U)[]
    ? U extends Record<string, any>
      ? FA<Extract<U, undefined> | NonNullable<U>>
      : NonNullable<U> extends Primitive
        ? FC<T[K]>
        : undefined
    : NonNullable<T[K]> extends Primitive
      ? FC<T[K]>
      : NonNullable<T[K]> extends Record<string, any>
        ? FG<NonNullable<T[K]>>
        : undefined;
};

interface Hierarchy {
  readonly parent: AC | undefined;
  readonly root: AC | undefined;
  readonly childList$: BehaviorSubject<AC[]>;
  readonly $childList: Signal<AC[]>;
  getChild: (path?: string[] | string) => AC | undefined;
  get hierarchyData(): HierarchyData;
}

interface HierarchyData {
  status: FormControlStatus;
  value: unknown;
  meta: Meta;
  children?: Record<string, HierarchyData>;
}

interface Meta {
  readonly untouched: boolean;
  readonly touched: boolean;
  readonly validity: FormControlStatus;
  readonly pristine: boolean;
  readonly dirty: boolean;
  readonly enabled: boolean;
  readonly disabled: boolean;
  readonly valueIsDefault: boolean;
  readonly updateOn: 'blur' | 'change' | 'submit';
  readonly errors: ValidationErrors$1 | null;
  readonly childControls: readonly Meta[] | undefined;
  hasError: (errorCode?: string, requireTouched?: boolean) => boolean;
  getErrorValue: (errorCode: string, requireTouched?: boolean) => Primitive;
}

interface MetaFns<TChild = AC> {
  setErrors: (errors: ValidationErrors$1 | null, emitEvent?: boolean) => TChild;
  markAsTouched: (markAncestors?: boolean, emitEvent?: boolean) => TChild;
  markAllAsTouched: (emitEvent?: boolean) => TChild;
  markAsUntouched: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
  markAsDirty: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
  markAsPristine: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
  disable: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
  enable: (emitEvent?: boolean, markAncestors?: boolean) => TChild;
}

type PrimitiveWithUndefined = Primitive | undefined;

interface RegisterFns<TChild = AC> {
  enableChange: (callback: (enabled: boolean) => void, destroyRef?: DestroyRef) => TChild;
  metaChange: (callback: (meta: Meta) => void, destroyRef?: DestroyRef) => TChild;
  alwaysDisabled: () => TChild;
}

export declare class TableauUiFormModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiFormModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiFormModule,
    [
      typeof FormErrorPipe,
      typeof FormHasErrorPipe,
      typeof FormMetaPipe,
      typeof FormArrayPipe,
      typeof FormControlPipe,
      typeof FormGroupPipe,
      typeof FormArrayValuePipe,
      typeof FormControlValuePipe,
      typeof FormGroupValuePipe,
      typeof FormArrayControlsPipe,
    ],
    [typeof i11.ReactiveFormsModule, typeof i12.CommonModule],
    [
      typeof FormErrorPipe,
      typeof FormHasErrorPipe,
      typeof FormMetaPipe,
      typeof FormArrayPipe,
      typeof FormControlPipe,
      typeof FormGroupPipe,
      typeof FormArrayValuePipe,
      typeof FormControlValuePipe,
      typeof FormGroupValuePipe,
      typeof FormArrayControlsPipe,
    ]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiFormModule>;
}

type ValidationErrors = Record<string, Primitive>;

type ValidatorFn = (control: AbstractControl) => ValidationErrors | null;

interface ValidatorFns<TChild = AC> {
  get validator(): ValidatorFn | null;
  set validator(validator: ValidatorFn | null);
  get asyncValidator(): AsyncValidatorFn | null;
  set asyncValidator(asyncValidatorFn: AsyncValidatorFn | null);
  setValidators: (validators: ValidatorFn | ValidatorFn[] | null) => TChild;
  setAsyncValidators: (validators: AsyncValidatorFn | AsyncValidatorFn[] | null) => TChild;
  addValidators: (validators: ValidatorFn | ValidatorFn[]) => TChild;
  addAsyncValidators: (validators: AsyncValidatorFn | AsyncValidatorFn[]) => TChild;
  removeValidators: (validators: ValidatorFn | ValidatorFn[]) => TChild;
  removeAsyncValidators: (validators: AsyncValidatorFn | AsyncValidatorFn[]) => TChild;
  hasValidator: (validator: ValidatorFn) => boolean;
  hasAsyncValidator: (validator: AsyncValidatorFn) => boolean;
  clearValidators: () => TChild;
  clearAsyncValidators: () => TChild;
}

export type {
  AC,
  AsyncValidatorFn,
  ControlsOf,
  FA,
  FC,
  FG,
  FaRegisterFns,
  FcRegisterFns,
  FgRegisterFns,
  FormReferencesOf,
  Hierarchy,
  HierarchyData,
  Meta,
  MetaFns,
  RegisterFns,
  ValidationErrors,
  ValidatorFn,
  ValidatorFns,
};
