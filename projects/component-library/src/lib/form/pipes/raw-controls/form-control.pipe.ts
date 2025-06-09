import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { AC } from '../../models/abstract-control/interfaces';
import type { FC } from '../../models/form-control/interfaces';
import type { FCImpl } from '../../models/form-control/impl';
import type { FormControl } from '@angular/forms';

@Pipe({
    name: 'formControl',
    standalone: false,
})
export class FormControlPipe implements PipeTransform {
    transform(form: AC, path?: string): FormControl {
        const ret = form.hierarchy.getChild(path);
        if (!ret) {
            throw new Error(`formControl: No child found at path "${path}"`);
        }
        if (ret.type !== 'control') {
            throw new Error(`formControl: Expected a FormControl at path "${path}", but got "${ret.type}"`);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (ret as FCImpl<any>).control as FormControl;
    }
}
