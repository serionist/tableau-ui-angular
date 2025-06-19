import { NgModule } from '@angular/core';
import { ArrowScrollComponent } from './arrow-scroll.component';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@NgModule({
  imports: [TableauUiButtonModule, TableauUiCommonModule, TableauUiIconModule],
  declarations: [ArrowScrollComponent],
  providers: [],
  exports: [ArrowScrollComponent],
})
export class TableauUiArrowScrollModule {}
