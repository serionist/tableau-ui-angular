import { PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import { importPrefix, importSuffix } from 'tableau-ui-angular/common/imports';
import { ButtonMenuComponent, MenuButtonComponent, MenuButtonGroupComponent, MenuComponent, MenuDirective } from 'tableau-ui-angular/menu';

function baseImport() {
    return [MenuComponent, MenuDirective];
}
export function importMenu() {
    return [...baseImport(), ...importPrefix(), ...importSuffix()];
}
export function importButtonMenu() {
    return [...baseImport(), ButtonMenuComponent, MenuButtonComponent, MenuButtonGroupComponent];
}
