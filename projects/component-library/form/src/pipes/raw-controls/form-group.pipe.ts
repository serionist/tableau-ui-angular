import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { AC } from '../../models/abstract-control/interfaces';
import type { FormGroup } from '@angular/forms';
import type { FGImpl } from '../../models/form-group/impl';

@Pipe({
    name: 'formGroup',
    standalone: true,
})
export class FormGroupPipe implements PipeTransform {
    transform(form: AC, path?: string): FormGroup {
        const ret = form.hierarchy.getChild(path);
        if (!ret) {
            throw new Error(`formGroup: No child found at path "${path}"`);
        }
        if (ret.type !== 'group') {
            throw new Error(`formGroup: Expected a FormGroup at path "${path}", but got "${ret.type}"`);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (ret as FGImpl<any>).control as FormGroup;
    }
}
