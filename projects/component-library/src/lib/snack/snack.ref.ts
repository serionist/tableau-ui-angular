import { InjectionToken } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export const TAB_SNACK_REF = new InjectionToken<SnackRef>('TAB_SNACK_REF');
export class SnackRef {
    private afterClosedSubject = new Subject<any>();

    afterClosed$: Observable<any> = this.afterClosedSubject.asObservable();

    close(result?: any): void {
        this.afterClosedSubject.next(result);
        this.afterClosedSubject.complete();
    }
}
