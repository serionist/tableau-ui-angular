import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableComponent } from './table.component';
import { HeaderDefDirective } from './defs/header-def/header-def.directive';
import { ColumnDefDirective } from './defs/column-def/column-def.directive';
import { CellDefDirective } from './defs/cell-def/cell-def.directive';
import { HeaderClassPipe } from './defs/header-def/header-class.pipe';
import { HeaderContextPipe } from './defs/header-def/header-context.pipe';
import { CellContextPipe } from './defs/cell-def/cell-context.pipe';
import { CellClassPipe } from './defs/cell-def/cell-class.pipe';
import { SortInfoPipe } from './sorting/sort-info-pipe';
import { ColWidthPipe } from './column-widths/col-width.pipe';
import { ColRenderedWidthDirective } from './column-widths/col-rendered-width.directive';
import { CellWidthPipe } from './column-widths/cell-width.pipe';
import { ResizerDirective } from './column-widths/resizer.directive';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import { RowSelectedPipe } from './selection/row-selected.pipe';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { HeaderCheckboxModePipe } from './selection/header-checkbox-mode.pipe';
import { HeaderToolipDefDirective } from './defs/header-def/header-toolip-def.directive';

import { CellToolipDefDirective } from './defs/cell-def/cell-toolip-def.directive';

import { HeaderTooltipPipe } from './defs/header-def/header-tooltip.pipe';
import { CellTooltipPipe } from './defs/cell-def/cell-tooltip.pipe';

@NgModule({
  imports: [CommonModule, TableauUiIconModule, TableauUiButtonModule, TableauUiTooltipModule, TableauUiCheckboxModule],
  declarations: [
    TableComponent,
    HeaderDefDirective,
    HeaderToolipDefDirective,
    HeaderTooltipPipe,
    HeaderContextPipe,
    HeaderClassPipe,
    ColumnDefDirective,
    CellDefDirective,
    CellContextPipe,
    CellClassPipe,
    CellToolipDefDirective,
    CellTooltipPipe,
    SortInfoPipe,
    ColWidthPipe,
    ColRenderedWidthDirective,
    CellWidthPipe,
    ResizerDirective,
    HeaderCheckboxModePipe,
    RowSelectedPipe,
  ],
  exports: [TableComponent, HeaderDefDirective, HeaderToolipDefDirective, ColumnDefDirective, CellDefDirective, CellToolipDefDirective, SortInfoPipe],
})
export class TableauUiTableModule {}
