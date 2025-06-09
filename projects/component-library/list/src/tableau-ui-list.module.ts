import { NgModule } from '@angular/core';
import { ListComponent } from './list.component';
import { CommonModule } from '@angular/common';
import { IsValueSelectedPipe } from './pipes/is-value-selected.pipe';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, TableauUiIconModule],
    declarations: [ListComponent, IsValueSelectedPipe],
    exports: [ListComponent],
})
export class TableauUiListModule {}
