/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormArray, FormGroup, FormControl } from '@angular/forms';

export type ControlsOf<T extends Record<string, any>> = {
    // eslint-disable-next-line @typescript-eslint/array-type
    [K in keyof T]-?: NonNullable<T[K]> extends Array<infer U>
        ? U extends Record<string, any>
            ? Extract<T, undefined> | FormArray<Extract<U, undefined> | FormGroup<ControlsOf<NonNullable<U>>>>
            : FormControl<T[K]> // If it's an array of primitives, map to FormControl<T[K]>
        : NonNullable<T[K]> extends Date
          ? FormControl<T[K]> // If it's a date, map to FormControl<T[K]>
          : NonNullable<T[K]> extends Record<string, any>
            ? FormGroup<ControlsOf<NonNullable<T[K]>>> | Extract<T, undefined> // If it's an object, map to FormGroup<ControlsOf<T[K]>>
            : FormControl<T[K]>; // Otherwise, map to FormControl
};
