import { Component, inject, TemplateRef } from '@angular/core';
import { DialogService } from '../../../../../component-library/src/public-api';
import { ExampleDialogComponent } from './example-dialog.component';

@Component({
    selector: 'app-dialogs-page',
    templateUrl: './dialogs-page.component.html',
    styleUrl: './dialogs-page.component.scss',
})
export class DialogsPageComponent {
    dialogService = inject(DialogService);
    openDialog(): void {
        const dialogRef = this.dialogService.openModal(
            ExampleDialogComponent,
            { message: 'This is a dynamic message!' },
            {
                width: 'calc(100vw - 100px)',
                height: 'fit-content',
                closeOnBackdropClick: true,
                maxWidth: '300px',
                header: {
                    allowClose: true,
                    title: 'This is a dynamic title!',
                },
            }
        );

        dialogRef.afterClosed$.subscribe((result) => {
            console.log('Dialog closed with result:', result);
        });
    }

    async openConfirmationDialog(
        color: 'primary' | 'error' | 'secondary' = 'secondary',
        autofocus?: 'accept' | 'cancel' | undefined,
        acceptBtnText?: string | undefined,
        cancelBtnText?: string | undefined
    ) {
        const dialogRef =
            await this.dialogService.openConfirmationMessageDialog(
                'This a random confirmation dialog',
                'Are you sure you want to delete this item? This stuff must be two lines long so I generate some random text.',
                color,
                acceptBtnText,
                cancelBtnText,
                autofocus
            );
        console.log('Confirmation dialog returned: ', dialogRef);
    }
    async openConfirmationTemplateDialog(
        template: TemplateRef<any>,
        color: 'primary' | 'error' | 'secondary' = 'secondary',
        autofocus: 'accept' | 'cancel' | undefined,
        acceptBtnText?: string | undefined,
        cancelBtnText?: string | undefined
    ) {
        const dialogRef =
            await this.dialogService.openConfirmationTemplateDialog(
                'This a random confirmation dialog',
                template,
                color,
                acceptBtnText,
                cancelBtnText,
                autofocus,
                {
                    width: '500px',
                }
            );
        console.log('Confirmation dialog returned: ', dialogRef);
    }
}