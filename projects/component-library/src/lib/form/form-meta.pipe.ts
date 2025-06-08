import { AbstractControl } from '@angular/forms';
import type { Observable } from 'rxjs';
import { map, of, switchMap } from 'rxjs';
import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { FC } from './public-api';
import type { AbstractControlMeta, AC } from './models/abstract-control.reference';

@Pipe({
    name: 'formMeta',
    standalone: false,
    pure: true,
})
export class FormMetaPipe implements PipeTransform {
    transform(form: AC | null | undefined, path?: string): Observable<AbstractControlMeta | null> {
        if (!form) {
            return of(null);
        }
        return form.hierarchy.getChild$(path).pipe(switchMap((c) => (c ? c.meta$ : of(null))));
    }
}
