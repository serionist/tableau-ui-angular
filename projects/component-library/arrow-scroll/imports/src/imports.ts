import { ArrowScrollComponent } from "tableau-ui-angular/arrow-scroll";
import { importIcons } from "tableau-ui-angular/icon/imports";

export function importArrowScroll() {
    return [ArrowScrollComponent, ...importIcons()];
}