import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import type { Meta } from '../../models/abstract-control/meta/interfaces';
import type { AC } from '../../models/abstract-control/interfaces';

@Pipe({
  name: 'formMeta',
  standalone: false,
  pure: true,
})
export class FormMetaPipe implements PipeTransform {
  transform(form: AC | null | undefined, path?: string): Observable<Meta | null> {
    if (!form) {
      return of(null);
    }
    return form.hierarchy.getChild(path)?.meta$ ?? of(null);
  }
}
