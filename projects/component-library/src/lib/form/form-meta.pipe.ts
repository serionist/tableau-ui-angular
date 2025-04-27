import { AbstractControl } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { Pipe } from '@angular/core';
import { AbstractControlMeta, FormHelper } from './form-helper';

@Pipe({
    name: 'formMeta',
    standalone: false,
    pure: false
})
export class FormMetaPipe {
    transform(
        form: AbstractControl | undefined | null,
        path?: string,
        fireInitial: boolean = true,
        listenFor: (
            | 'touched'
            | 'status'
            | 'pristine'
            | 'submitted'
            | 'reset'
        )[] = ['touched', 'status']
    ): Observable<AbstractControlMeta | null> {
        if (!form) {
            return of(null);
        }
        const pathParts = path?.split('.').filter((p) => p !== '') ?? [];
        return FormHelper.getFormControl(form, pathParts).pipe(
            switchMap((e) =>
                e ? FormHelper.getMeta$(e, fireInitial, listenFor) : of(null)
            )
        );
    }
}
