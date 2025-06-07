import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multipleTemplate',
  standalone: false
})
export class MultipleTemplatePipe implements PipeTransform {

  transform(template: string, number: number): unknown {
    return template.replace('{number}', number.toString());
  }

}
