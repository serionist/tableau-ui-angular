import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SnackComponent } from './snack.component';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

// SnackService is provided in root and only there: one for the app, whatever imports this module
@NgModule({
  imports: [CommonModule, TableauUiIconModule],
  declarations: [SnackComponent],
  exports: [],
})
export class TableauUiSnackModule {}
