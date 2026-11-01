import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import appConfigTs from '../../app.config.ts?source' with { loader: 'text' };
import { DocsCodeComponent } from '../../docs/docs-code.component';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { colorProperties, otherProperties } from './theme-properties';
import { THEMING_EXAMPLES } from './theming.examples';

@Component({
  selector: 'app-theming-page',
  imports: [TableauUiCommonModule, DocsCodeComponent, DocsExampleComponent],
  templateUrl: './theming-page.component.html',
  styleUrl: './theming-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemingPageComponent {
  protected readonly examples = THEMING_EXAMPLES;
  protected readonly appConfigTs = appConfigTs;
  protected readonly colors = colorProperties();
  protected readonly others = otherProperties();
  // The pairs the library's contrast spec reads, theme/src/theme-contrast.spec.ts
  protected readonly contrastPairs = [
    { text: '--twc-color-error', background: '--twc-color-base', where: "The page, a dialog's body, an input" },
    { text: '--twc-color-error', background: '--twc-color-primary-light', where: "A table's selected row" },
    { text: '--twc-color-error', background: '--twc-color-highlight', where: 'The keyboard highlight in a list, a select, an autocomplete and a menu' },
    { text: '--twc-color-error', background: '--twc-modal-color-header', where: "A modal's header" },
    { text: '--twc-color-base', background: '--twc-color-error', where: "A raised error button's label" },
  ];
}
