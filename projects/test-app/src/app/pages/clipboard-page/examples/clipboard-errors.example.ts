import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { ClipboardService } from 'tableau-ui-angular/clipboard';

@Component({
  selector: 'app-clipboard-errors-example',
  imports: [TableauUiButtonModule],
  templateUrl: './clipboard-errors.example.html',
  styleUrl: './clipboard-errors.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipboardErrorsExampleComponent {
  private readonly clipboard = inject(ClipboardService);

  protected readonly $result = signal('Nothing yet');

  // false: the service shows no snack, and the app says what went wrong itself
  protected async copy() {
    try {
      await this.clipboard.writeText('Copied from the Tableau UI docs', false);
      this.$result.set('Copied the text');
    } catch (error) {
      this.$result.set(`Not copied: ${(error as Error).message}`);
    }
  }

  protected async read() {
    try {
      const text = await this.clipboard.readText(false);
      this.$result.set(`The clipboard holds: ${text}`);
    } catch (error) {
      this.$result.set(`Not read: ${(error as Error).message}`);
    }
  }
}
