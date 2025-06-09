import { OptionComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import { importOption, importPrefix, importSuffix } from 'tableau-ui-angular/common/imports';
import { SelectComponent } from 'tableau-ui-angular/select';

export function importSelect() {
    return [SelectComponent, ...importOption()];
}
