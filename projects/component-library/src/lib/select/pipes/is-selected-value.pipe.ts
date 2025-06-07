import { Pipe, PipeTransform } from '@angular/core';
import { OptionComponent } from '../../common/option';

@Pipe({
  name: 'isSelectedValue',
  standalone: false
})
export class IsSelectedValuePipe implements PipeTransform {

  transform(option: OptionComponent, allowMultiple: boolean, value: any | any[]): boolean {
    if (allowMultiple) {
      return value instanceof Array && value.includes(option.$value());
    }
    return option.$value() === value;
  }

}
