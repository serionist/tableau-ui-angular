import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiButtonModule } from '../button/tableau-ui-button.module';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
@NgModule({
    imports: [CommonModule, TableauUiButtonModule],
    declarations: [ConfirmationDialogComponent],
    exports: [ConfirmationDialogComponent],
})
export class TableauUiDialogModule {}
