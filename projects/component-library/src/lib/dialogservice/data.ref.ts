import { inject, InjectionToken } from '@angular/core';

export const TAB_DATA_REF = new InjectionToken<unknown>('TAB_DIALOG_DATA_REF');

export function injectDialogData<T>(): T {
    return inject(TAB_DATA_REF) as T;
}
