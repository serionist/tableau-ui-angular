import { FormArrayReference } from "../models/form-array.reference";
import { FormControlReference } from "../models/form-control.reference";
import { FormGroupReference } from "../models/form-group.reference";

export type FormReferencesOf<T extends Record<string, any>> = {
    [K in keyof T]: NonNullable<T[K]> extends Array<infer U>
      ? U extends Record<string, any>
        ? FormArrayReference<NonNullable<U> | Extract<U, undefined>>
        : FormControlReference<T[K]>
      : NonNullable<T[K]> extends Date
      ? FormControlReference<T[K]>
      : NonNullable<T[K]> extends Record<any, any>
      ? FormGroupReference<NonNullable<T[K]>>
      : FormControlReference<T[K]>;
  };