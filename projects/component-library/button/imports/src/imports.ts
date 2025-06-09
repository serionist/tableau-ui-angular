import { ButtonComponent, ButtonToggleComponent } from "tableau-ui-angular/button";
import { OptionComponent } from "tableau-ui-angular/common";
import { importOption } from "tableau-ui-angular/common/imports";

export function importButton() {
    return [ButtonComponent]
}
export function importButtonToggle() {
    return [ButtonToggleComponent, ...importOption()]
}
export function importAllButtons() {
    return [...importButton(), ...importButtonToggle()];
}