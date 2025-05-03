import { Pipe } from '@angular/core';
import { flatMap, map, Observable, of, switchMap } from 'rxjs';
import { AC } from './models/abstract-control.reference';
import { FA } from './models/form-array.reference';
import { FG } from './models/form-group.reference';
import { FC } from './models/form-control.reference';
import {
    AbstractControl,
    FormArray,
    FormControl,
    FormGroup,
} from '@angular/forms';

@Pipe({
    name: 'formChild',
    standalone: false,
    pure: true,
})
export class FormChildPipe {
    transform<T extends 'control' | 'group' | 'array' | 'abstract' = 'control'>(
        form: AC | undefined | null,
        path?: string | undefined,
        type?: T
    ): Observable<
        T extends 'control'
            ? FC | null
            : T extends 'group'
            ? FG | null
            : T extends 'array'
            ? FA | null
            : T extends 'abstract'
            ? AC | null
            : AC | null
    > {
        if (!form) {
            return of(null) as any;
        }
        return form.hierarchy.getChild(path).pipe(
            map((c) => {
                if (!c) {
                    return null;
                }
                if (type === 'control') {
                    if (c.type === 'control') {
                        return c as FC;
                    }
                    throw new Error(
                        'Expected a control, but got a ' + c.type
                    );
                }
                if (type === 'group') {
                    if (c.type === 'group') {
                        return c as FG;
                    }
                    throw new Error(
                        'Expected a group, but got a ' + c.type
                    );
                }
                if (type === 'array') {
                    if (c.type === 'array') {
                        return c as FA;
                    }
                    throw new Error(
                        'Expected a array, but got a ' + c.type
                    );
                }
                return c as AC;
            })
        ) as unknown as Observable<
            T extends 'control'
                ? FC | null
                : T extends 'group'
                ? FG | null
                : T extends 'array'
                ? FA | null
                : T extends 'abstract'
                ? AC | null
                : AC | null
        >;
    }
}
