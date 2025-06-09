import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from 'tableau-ui-angular/checkbox';
import { ErrorComponent, HintComponent } from 'tableau-ui-angular/common';
import { importError, importHint } from 'tableau-ui-angular/common/imports';

export function importCheckbox() {
    return [CheckboxComponent, ...importHint(), ...importError(), ReactiveFormsModule];
}
