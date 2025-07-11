import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ClipboardService, TableauUiClipboardModule } from 'tableau-ui-angular/clipboard';
import { SnackService, TableauUiSnackModule } from 'tableau-ui-angular/snack';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';

@Component({
  selector: 'app-clipboard-page',
  imports: [TableauUiCommonModule, TableauUiClipboardModule, TableauUiSnackModule],
  standalone: true,
  templateUrl: './clipboard-page.component.html',
  styleUrl: './clipboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipboardPageComponent {
  clipboardService = inject(ClipboardService);
  snackService = inject(SnackService);

  async writeText(text: string) {
    await this.clipboardService.writeText(text);
    this.snackService.openSnack('Text copied to clipboard', 2000);
  }
  readText(): void {
    this.clipboardService
      .readText()
      .then(text => {
        alert('Read text: ' + text);
        console.log('Read text:', text);
      })
      .catch((error: unknown) => {
        console.error('Failed to read clipboard text:', error);
        alert('Failed to read clipboard text');
      });
  }
}
