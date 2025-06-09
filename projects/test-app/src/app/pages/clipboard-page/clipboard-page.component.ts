import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ClipboardService } from 'tableau-ui-angular/clipboard';
import { importClipboardProvider } from 'tableau-ui-angular/clipboard/imports';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { ImportDetailsComponent } from "../../components/import-details/import-details.component";

@Component({
    selector: 'app-clipboard-page',
    imports: [...importSeparator(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './clipboard-page.component.html',
    styleUrl: './clipboard-page.component.scss',
    providers: [...importSnackProvider(), ...importClipboardProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
export class ClipboardPageComponent {
    clipboardService = inject(ClipboardService);
    snackService = inject(SnackService);

      import: ImportModel = {
                name: 'Clipboard',
                providerImports: [
                    {
                        name: 'ClipboardService',
                        from: 'tableau-ui-angular/clipboard',
                        info: 'Service for reading and writing text to the clipboard.'
                    }
                ],
                providerImportFunctions: [
                    {
                        name: 'importClipboardProvider',
                        from: 'tableau-ui-angular/clipboard/imports',
                        info: 'Imports ClipboardService and all its dependencies.'
                    }
                ]
            };

    async writeText(text: string) {
        await this.clipboardService.writeText(text);
        this.snackService.openSnack('Text copied to clipboard', 2000);
    }
    readText(): void {
        this.clipboardService
            .readText()
            .then((text) => {
                alert('Read text: ' + text);
                console.log('Read text:', text);
            })
            .catch((error: unknown) => {
                console.error('Failed to read clipboard text:', error);
                alert('Failed to read clipboard text');
            });
    }
}
