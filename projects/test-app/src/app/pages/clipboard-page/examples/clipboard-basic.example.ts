import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { ClipboardService } from 'tableau-ui-angular/clipboard';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-clipboard-basic-example',
  imports: [TableauUiButtonModule],
  templateUrl: './clipboard-basic.example.html',
  styleUrl: './clipboard-basic.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipboardBasicExampleComponent {
  private readonly clipboard = inject(ClipboardService);
  private readonly snacks = inject(SnackService);

  protected readonly $read = signal<string | undefined>(undefined);

  // When the browser refuses, the service shows an error snack and the call rejects, so there is nothing more to do
  protected async copy() {
    try {
      await this.clipboard.writeText('Copied from the Tableau UI docs');
    } catch {
      return;
    }
    this.snacks.openSnack('Copied the text', 2000, 'success');
  }

  protected async read() {
    try {
      this.$read.set(await this.clipboard.readText());
    } catch {
      // the service has shown why
    }
  }
}
