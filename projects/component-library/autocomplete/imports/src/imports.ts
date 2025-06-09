import { AutoCompleteComponent, AutoCompleteDirective } from "tableau-ui-angular/autocomplete";
import { OptionComponent } from "tableau-ui-angular/common";
import { importOption } from "tableau-ui-angular/common/imports";

export function importAutocomplete() {
    return [AutoCompleteComponent, AutoCompleteDirective, ...importOption()];
}