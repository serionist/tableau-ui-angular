import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ClipboardService, SnackService } from 'component-library';

@Component({
    selector: 'app-clipboard-page',
    standalone: false,
    templateUrl: './clipboard-page.component.html',
    styleUrl: './clipboard-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipboardPageComponent {
    clipboardService = inject(ClipboardService);
    snackService = inject(SnackService);
    writeText(text: string): void {
        this.clipboardService.writeText(text);
        this.snackService.openSnack('Text copied to clipboard', 2000);
    }
    readText(): void {
        this.clipboardService
            .readText()
            .then((text) => {
                alert('Read text: ' + text);
                console.log('Read text:', text);
            })
            .catch((error) => {
                console.error('Failed to read clipboard text:', error);
                alert('Failed to read clipboard text: ' + error);
            });
    }
}
