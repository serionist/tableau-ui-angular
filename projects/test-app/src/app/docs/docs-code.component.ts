import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, resource } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { ClipboardService } from 'tableau-ui-angular/clipboard';
import { SnackService } from 'tableau-ui-angular/snack';
import { ThemeService } from 'tableau-ui-angular/theme';
import { CODE_COLOURS, codeLanguage } from './docs-code-colours';
import { DocsMonacoService } from './docs-monaco.service';

/**
 * A file's text, or a command, with a button that copies it. The page, prerendered, shows the plain text; in the
 * browser Monaco colours it, in the language its label names, once Monaco has loaded (`DocsMonacoService`).
 */
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
  private readonly monaco = inject(DocsMonacoService);
  private readonly theme = inject(ThemeService);

  /** The text shown and copied: a trailing line break, which every file has, is left out */
  readonly $source = input.required<string>({ alias: 'source' });
  /** What the text is, such as `TS` or `styles.scss`: the code's name for screen readers, and the copy button's */
  readonly $label = input.required<string>({ alias: 'label' });

  protected readonly $text = computed(() => this.$source().replace(/\r?\n$/, ''));

  // Monaco's tokens for the text, once Monaco has loaded; none on the server, before the load and after a failed one
  private readonly tokens = resource({
    params: () => {
      const language = codeLanguage(this.$label());
      return language !== undefined && this.monaco.$monaco() !== undefined ? { text: this.$text(), language } : undefined;
    },
    loader: async ({ params }) => this.monaco.tokens(params.text, params.language),
  });

  /** The text in runs, each in the colour of its kind of token in the site's mode; one plain run until it is coloured */
  protected readonly $runs = computed(() => {
    const tokens = this.tokens.hasValue() ? this.tokens.value() : undefined;
    if (!tokens) {
      return [{ text: this.$text(), colour: undefined }];
    }
    const mode = this.theme.$appliedThemeMode();
    return tokens.map(({ text, scope }) => ({ text, colour: scope === undefined ? undefined : CODE_COLOURS[scope][mode] }));
  });

  constructor() {
    const block = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    // in the browser only: Monaco loads once a block is near the screen. A command, a line of shell, is coloured once
    // another block has loaded it, but never loads it itself: a page whose only code is a command doesn't fetch Monaco
    afterNextRender(() => {
      const language = codeLanguage(this.$label());
      if (language !== undefined && language !== 'shell') {
        destroyRef.onDestroy(this.monaco.watch(block));
      }
    });
  }

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
