import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent, HintComponent, LabelComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import { importError, importHint, importLabel, importPrefix, importSuffix } from 'tableau-ui-angular/common/imports';
import { FormFieldComponent } from 'tableau-ui-angular/form-field';

export function importFormField() {
    return [ReactiveFormsModule, FormFieldComponent, ...importLabel(), ...importHint(), ...importError(), ...importPrefix(), ...importSuffix()];
}
