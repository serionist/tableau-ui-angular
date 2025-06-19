import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SnackComponent } from './snack.component';
import { RouterModule } from '@angular/router';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService } from './snack.service';

@NgModule({
  imports: [CommonModule, TableauUiIconModule, RouterModule],
  declarations: [SnackComponent],
  providers: [SnackService],
  exports: [],
})
export class TableauUiSnackModule {}
