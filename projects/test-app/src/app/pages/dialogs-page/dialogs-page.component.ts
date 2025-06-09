import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExampleDialogComponent } from './example-dialog.component';
import { importDialogProvider } from 'tableau-ui-angular/dialog/imports';
import { DialogService } from 'tableau-ui-angular/dialog';
import type { ImportModel } from '../../components/import-details/import-model';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { importIcons } from 'tableau-ui-angular/icon/imports';
import { ImportDetailsComponent } from "../../components/import-details/import-details.component";
import { importCheckbox } from 'tableau-ui-angular/checkbox/imports';

@Component({
    selector: 'app-dialogs-page',
    imports: [...importSeparator(), ...importIcons(), ImportDetailsComponent, ...importCheckbox()],
    standalone: true,
    templateUrl: './dialogs-page.component.html',
    styleUrl: './dialogs-page.component.scss',
    providers: [...importDialogProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
export class DialogsPageComponent {
    dialogService = inject(DialogService);

    import: ImportModel = {
        name: 'Dialog',
       providerImports: [
            {
                name: 'DialogService',
                from: 'tableau-ui-angular/dialog',
                info: 'Service for opening dialogs and confirmation messages.'
            }
        ],
        importFunctions: [
            {
                name: 'importDialogProvider',
                from: 'tableau-ui-angular/dialog/imports',
                info: 'Imports dialog service and all its dependencies.'
            }
        ]
    };
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
