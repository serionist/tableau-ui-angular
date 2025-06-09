import { ErrorComponent, OptionComponent } from 'tableau-ui-angular/common';
import { importError, importOption } from 'tableau-ui-angular/common/imports';
import { RadioGroupComponent } from 'tableau-ui-angular/radio-group';
export function importRadioGroup() {
    return [RadioGroupComponent, ...importError(), ...importOption()];
}