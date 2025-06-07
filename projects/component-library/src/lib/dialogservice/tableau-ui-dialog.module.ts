import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiButtonModule } from '../button/tableau-ui-button.module';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { TemplateDialogComponent } from './template-dialog.component';
@NgModule({
    declarations: [ConfirmationDialogComponent, TemplateDialogComponent],
    imports: [CommonModule, TableauUiButtonModule],
    exports: [ConfirmationDialogComponent, TemplateDialogComponent],
})
export class TableauUiDialogModule {}
