import { ErrorComponent, HintComponent, LabelComponent, OptionComponent } from 'tableau-ui-angular/common';
import { importError, importHint, importLabel, importOption } from 'tableau-ui-angular/common/imports';
import { ListComponent } from 'tableau-ui-angular/list';

export function importList() {
    return [ListComponent, ...importLabel(), ...importHint(), ...importError(), ...importOption()];
}
