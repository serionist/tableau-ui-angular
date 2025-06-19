import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TabComponent } from './tab.component';
import { TabGroupComponent } from './tab-group.component';
import { TableauUiArrowScrollModule } from 'tableau-ui-angular/arrow-scroll';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@NgModule({
  imports: [CommonModule, TableauUiArrowScrollModule, TableauUiIconModule],
  declarations: [TabComponent, TabGroupComponent],
  exports: [TabComponent, TabGroupComponent],
})
export class TableauUiTabgroupModule {}
