import { FA, FC, FG } from "../public-api";


export type FormReferencesOf<T extends Record<string, any>> = {
    [K in keyof T]: NonNullable<T[K]> extends Array<infer U>
      ? U extends Record<string, any>
        ? FA<NonNullable<U> | Extract<U, undefined>>
        : FC<T[K]>
      : NonNullable<T[K]> extends Date
      ? FC<T[K]>
      : NonNullable<T[K]> extends Record<any, any>
      ? FG<NonNullable<T[K]>>
      : FC<T[K]>;
  };