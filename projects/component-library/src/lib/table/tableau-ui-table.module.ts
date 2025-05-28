import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableComponent } from './table.component';
import { HeaderDefDirective } from './header-def/header-def.directive';
import { ColumnDefDirective } from './column-def/column-def.directive';
import { CellDefDirective } from './cell-def/cell-def.directive';
import { HeaderClassPipe } from './header-def/header-class.pipe';
import { HeaderContextPipe } from './header-def/header-context.pipe';
import { CellContextPipe } from './cell-def/cell-context.pipe';
import { CellClassPipe } from './cell-def/cell-class.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [
        TableComponent,
        HeaderDefDirective,
        HeaderContextPipe,
        HeaderClassPipe,
        ColumnDefDirective,
        CellDefDirective,
        CellContextPipe,
        CellClassPipe
    ],
    exports: [
        TableComponent,
        HeaderDefDirective,
        ColumnDefDirective,
        CellDefDirective,
    ],
})
export class TableauUiTableModule {}
