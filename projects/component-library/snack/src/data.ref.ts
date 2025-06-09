import { inject, InjectionToken } from '@angular/core';

export const TAB_SNACK_DATA_REF = new InjectionToken<unknown>('TAB_SANCK_DATA_REF');
export function injectSnackData<T>(): T {
    return inject(TAB_SNACK_DATA_REF) as T;
}
