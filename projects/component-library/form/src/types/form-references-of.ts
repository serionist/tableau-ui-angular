/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FA } from '../models/form-array/interaces';
import type { FC } from '../models/form-control/interfaces';
import type { FG } from '../models/form-group/interfaces';
import type { Primitive } from 'tableau-ui-angular/types';

export type FormReferencesOf<T extends Record<string, any>> = {
  [K in keyof T]-?: NonNullable<T[K]> extends (infer U)[]
    ? U extends Record<string, any>
      ? FA<Extract<U, undefined> | NonNullable<U>> // FA<Extract<U, undefined> | NonNullable<U>>
      : NonNullable<U> extends Primitive
        ? FC<T[K]>
        : undefined
    : NonNullable<T[K]> extends Primitive
      ? FC<T[K]>
      : NonNullable<T[K]> extends Record<string, any>
        ? FG<NonNullable<T[K]>>
        : undefined; // FC<T[K]>;
};
