import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { TemplateDialogComponent } from './template-dialog.component';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { DialogService } from './dialog.service';
@NgModule({
    imports: [CommonModule, TableauUiButtonModule],
    declarations: [ConfirmationDialogComponent, TemplateDialogComponent],
    providers: [DialogService],
})
export class TableauUiDialogModule {}
