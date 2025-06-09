import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExampleDialogComponent } from './example-dialog.component';
import { DialogService, TableauUiDialogModule } from 'tableau-ui-angular/dialog';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@Component({
    selector: 'app-dialogs-page',
    imports: [TableauUiCommonModule, TableauUiButtonModule, TableauUiDialogModule, TableauUiCheckboxModule, TableauUiIconModule],
    standalone: true,
    templateUrl: './dialogs-page.component.html',
    styleUrl: './dialogs-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogsPageComponent {
    dialogService = inject(DialogService);

    openDialog(): void {
        const dialogRef = this.dialogService.openModal<ExampleDialogComponent, string, string>(ExampleDialogComponent, 'This is a dynamic message!', {
            width: 'calc(100vw - 100px)',
            height: 'fit-content',
            closeOnBackdropClick: true,
            maxWidth: '300px',
            header: {
                allowClose: true,
                title: 'This is a dynamic title!',
            },
        });

        dialogRef.closed$.subscribe((result) => {
            console.log('Dialog closed with result:', result);
        });
    }

    async openConfirmationDialog(color: 'error' | 'primary' | 'secondary' = 'secondary', autofocus?: 'accept' | 'cancel', acceptBtnText?: string, cancelBtnText?: string) {
        const dialogRef = await this.dialogService.openConfirmationMessageDialog(
            'This a random confirmation dialog',
            'Are you sure you want to delete this item? This stuff must be two lines long so I generate some random text.',
            color,
            acceptBtnText,
            cancelBtnText,
            autofocus,
        );
        console.log('Confirmation dialog returned: ', dialogRef);
    }
    async openConfirmationTemplateDialog(
        template: TemplateRef<unknown>,
        color: 'error' | 'primary' | 'secondary' = 'secondary',
        autofocus: 'accept' | 'cancel' | undefined,
        acceptBtnText?: string,
        cancelBtnText?: string,
    ) {
        const dialogRef = await this.dialogService.openConfirmationTemplateDialog('This a random confirmation dialog', template, undefined, color, acceptBtnText, cancelBtnText, autofocus, {
            width: '500px',
        });
        console.log('Confirmation dialog returned: ', dialogRef);
    }
}
