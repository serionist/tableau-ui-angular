import { AbstractControl } from '@angular/forms';
import { map, Observable, of, switchMap } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { FC } from './public-api';
import { AbstractControlMeta, AC } from './models/abstract-control.reference';

@Pipe({
    name: 'formMeta',
    standalone: false,
    pure: true,
})
export class FormMetaPipe implements PipeTransform {
    transform(form: AC | undefined | null, path?: string): Observable<AbstractControlMeta | null> {
        if (!form) {
            return of(null);
        }
        return form.hierarchy.getChild$(path).pipe(switchMap((c) => (c ? c.meta$ : of(null))));
    }
}
