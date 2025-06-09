import { CellDefDirective, ColumnDefDirective, HeaderDefDirective, TableComponent } from "tableau-ui-angular/table";

export function importTable() {
    return [TableComponent, HeaderDefDirective, ColumnDefDirective, CellDefDirective];
}