import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExampleSnackComponent } from './example-snack.component';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { SnackRef } from 'tableau-ui-angular/snack';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { ImportDetailsComponent } from '../../components/import-details/import-details.component';
import type { ImportModel } from '../../components/import-details/import-model';
import { importButton } from 'tableau-ui-angular/button/imports';
import { importCheckbox } from 'tableau-ui-angular/checkbox/imports';

@Component({
    selector: 'app-snacks-page',
    imports: [...importSeparator(), ...importButton(), ...importCheckbox(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './snacks-page.component.html',
    styleUrl: './snacks-page.component.scss',
    providers: [...importSnackProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnacksPageComponent {
    snackService = inject(SnackService);
    imports: ImportModel = {
        name: 'Snack',
        providerImports: [
            {
                name: 'SnackService',
                from: 'tableau-ui-angular/snack',
                info: 'Service for managing snack notifications.',
            },
        ],
        providerImportFunctions: [
            {
                name: 'importSnackProvider',
                from: 'tableau-ui-angular/snack/imports',
                info: 'Imports snack provider for the SnackService.',
            },
        ],
    };

    openCustomSnack(duration: number | undefined = 5000, type: 'error' | 'info' | 'success' = 'info', location: 'bottom' | 'top' = 'top') {
        const snackRef = this.snackService.openSnackComponent<ExampleSnackComponent, { message: string }, string>(ExampleSnackComponent, { message: 'This is a custom snack compoenent' }, duration, type, location);
        snackRef.closed$.subscribe((result) => {
            console.log('Snack closed with result:', result);
        });
    }

    snackAction(snackRef: SnackRef<boolean>) {
        snackRef.close();
        this.snackService.openSnack('Action executed!', 3000, 'info', 'top');
    }
}
