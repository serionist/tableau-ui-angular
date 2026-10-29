import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';

// DialogService is provided in root and only there: one stack for the app, whatever imports this module
@NgModule({
  imports: [CommonModule, TableauUiButtonModule],
  declarations: [ConfirmationDialogComponent],
})
export class TableauUiDialogModule {}
