import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { ClipboardService } from 'tableau-ui-angular/clipboard';
import { SnackService } from 'tableau-ui-angular/snack';

/** A file's text, or a command, with a button that copies it */
@Component({
  selector: 'app-docs-code',
  imports: [TableauUiButtonModule],
  templateUrl: './docs-code.component.html',
  styleUrl: './docs-code.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsCodeComponent {
  private readonly clipboard = inject(ClipboardService);
  private readonly snacks = inject(SnackService);

  /** The text shown and copied: a trailing line break, which every file has, is left out */
  readonly $source = input.required<string>({ alias: 'source' });
  /** What the text is, such as `TS` or `styles.scss`: the code's name for screen readers, and the copy button's */
  readonly $label = input.required<string>({ alias: 'label' });

  protected readonly $text = computed(() => this.$source().replace(/\r?\n$/, ''));

  protected async copy() {
    try {
      await this.clipboard.writeText(this.$text());
    } catch {
      // the clipboard service has said why, in a snack
      return;
    }
    this.snacks.openSnack(`Copied the ${this.$label()}`, 2000, 'success');
  }
}
