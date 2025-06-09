import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({
    name: 'multipleTemplate',
    standalone: true,
})
export class MultipleTemplatePipe implements PipeTransform {
    transform(template: string, number: number): unknown {
        return template.replace('{number}', number.toString());
    }
}
