import { NgModule } from '@angular/core';
import { ListComponent } from './list.component';
import { CommonModule } from '@angular/common';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';
import { IsValueSelectedPipe } from './pipes/is-value-selected.pipe';

@NgModule({
    declarations: [ListComponent, IsValueSelectedPipe],
    imports: [CommonModule, TableauUiCommonModule, TableauUiIconModule],
    exports: [ListComponent],
})
export class TableauUiListModule {}
