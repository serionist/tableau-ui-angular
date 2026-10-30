import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FA } from '../models/form-array/interaces';
import type { FG } from '../models/form-group/interfaces';

@Pipe({
  name: 'formArrayControls',
  standalone: false,
})
export class FormArrayControlsPipe implements PipeTransform {
  // generic, as the value pipes are: a typed FA<T> is no FA<any>, since its push takes only FG<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform<T extends Record<string, any>>(form: FA<T>): Observable<FG<T>[]> {
    return form.controls$;
  }
}
