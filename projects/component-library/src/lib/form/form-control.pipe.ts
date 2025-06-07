import { Pipe, PipeTransform } from '@angular/core';
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
import { ControlRegistry } from './models/control-registry';

@Pipe({
    name: 'formControl',
    standalone: false,
    pure: true,
})
export class FormControlPipe implements PipeTransform{
    transform<T extends 'control' | 'group' | 'array' | 'abstract' = 'control'>(
        form: AC | undefined | null,
        path?: string | undefined,
        type?: T
    ): Observable<
        T extends 'control'
            ? FormControl | null
            : T extends 'group'
            ? FormGroup | null
            : T extends 'array'
            ? FormArray | null
            : T extends 'abstract'
            ? AbstractControl | null
            : AbstractControl | null
    > {
        if (!form) {
            return of(null) as any;
        }
        return form.hierarchy.getChild$(path).pipe(
            map((c) => {
                if (!c) {
                    return null;
                }
                const control = ControlRegistry.controls.get(c.id);
                if (!control) {
                    console.warn(
                        `Control with id ${c.id} not found in registry.`
                    );
                    return null;
                }
                if (type === 'control') {
                    if (control instanceof FormControl) {
                        return control;
                    }
                    throw new Error(
                        'Expected a FormControl, but got a ' + c.type
                    );
                }
                if (type === 'group') {
                    if (control instanceof FormGroup) {
                        return control;
                    }
                    throw new Error(
                        'Expected a FormGroup, but got a ' + c.type
                    );
                }
                if (type === 'array') {
                    if (control instanceof FormArray) {
                        return control;
                    }
                    throw new Error(
                        'Expected a FormArray, but got a ' + c.type
                    );
                }
                return control;
            })
        ) as unknown as Observable<
            T extends 'control'
                ? FormControl | null
                : T extends 'group'
                ? FormGroup | null
                : T extends 'array'
                ? FormArray | null
                : T extends 'abstract'
                ? AbstractControl | null
                : AbstractControl | null
        >;
    }
}
