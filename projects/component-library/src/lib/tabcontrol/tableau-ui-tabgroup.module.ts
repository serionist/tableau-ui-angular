import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TabComponent } from './tab.component';
import { TabGroupComponent } from './tabgroup.component';
import { TableauUiArrowScrollModule } from '../arrow-scroll/tableau-ui-arrow-scroll.module';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';

@NgModule({
    declarations: [TabComponent, TabGroupComponent],
    imports: [CommonModule, TableauUiArrowScrollModule, TableauUiIconModule],
    exports: [TabComponent, TabGroupComponent],
})
export class TableauUiTabgroupModule {}
