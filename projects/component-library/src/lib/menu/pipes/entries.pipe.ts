import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'entries',
    standalone: false,
})
export class EntriesPipe implements PipeTransform {
    transform<T>(arr: readonly T[]) {
        return [...arr.entries()];
    }
}
