import { InjectionToken } from "@angular/core";
import { Subject, Observable } from "rxjs";

export const TAB_DIALOG_REF = new InjectionToken<DialogRef>('TAB_DIALOG_REF');
export class DialogRef {
    private afterClosedSubject = new Subject<any>();
  
    afterClosed$: Observable<any> = this.afterClosedSubject.asObservable();
  
    close(result?: any): void {
      this.afterClosedSubject.next(result);
      this.afterClosedSubject.complete();
    }
  }