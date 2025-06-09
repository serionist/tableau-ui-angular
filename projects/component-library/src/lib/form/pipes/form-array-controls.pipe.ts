import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { FA } from '../models/form-array/interaces';

@Pipe({
    name: 'formArrayControls',
    standalone: false,
})
export class FormArrayControlsPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform(form: FA<any>) {
        return form.controls$;
    }
}
