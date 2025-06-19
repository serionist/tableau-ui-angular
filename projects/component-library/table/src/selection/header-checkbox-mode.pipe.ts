import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { SelectionOptions } from './selection-options';
import { MultiSelectionOptions } from './selection-options';

@Pipe({
  name: 'headerCheckboxMode',
  standalone: false,
})
export class HeaderCheckboxModePipe implements PipeTransform {
  transform(selectionOptions: SelectionOptions | undefined): 'none' | 'selectNone' | 'selectAll' | undefined {
    if (selectionOptions instanceof MultiSelectionOptions) {
      return selectionOptions.headerCheckboxMode;
    }
    return 'none';
  }
}
