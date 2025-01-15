import { Component, inject } from '@angular/core';
import { ClipboardService, SnackService } from '../../../../../component-library/src/public-api';

@Component({
    selector: 'app-clipboard-page',
    templateUrl: './clipboard-page.component.html',
    styleUrl: './clipboard-page.component.scss',
    standalone: false
})
export class ClipboardPageComponent {
  clipboardService = inject(ClipboardService);
  snackService = inject(SnackService);
  writeText(text: string): void {
    this.clipboardService.writeText(text);
    this.snackService.openSnack('Text copied to clipboard', 2000);
  }
  readText(): void {
    this.clipboardService.readText().then((text) => {
      alert('Read text: ' + text);
      console.log('Read text:', text);
    }).catch((error) => {
      console.error('Failed to read clipboard text:', error);
      alert('Failed to read clipboard text: ' + error);
    });
  }
}
