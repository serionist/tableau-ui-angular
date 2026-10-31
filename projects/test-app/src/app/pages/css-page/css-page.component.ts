import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsCodeComponent } from '../../docs/docs-code.component';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { FONTS_COMMAND } from '../getting-started-page/commands';
import { otherProperties } from '../theming-page/theme-properties';
import { CSS_EXAMPLES } from './css.examples';
import { FONT_IMPORT, fontFaces, ROBOTO_IMPORT, STYLES_USE } from './styles';

@Component({
  selector: 'app-css-page',
  imports: [RouterLink, TableauUiCommonModule, DocsCodeComponent, DocsExampleComponent],
  templateUrl: './css-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssPageComponent {
  protected readonly examples = CSS_EXAMPLES;

  protected readonly stylesUse = STYLES_USE;
  protected readonly fontImport = FONT_IMPORT;
  protected readonly robotoImport = ROBOTO_IMPORT;
  protected readonly fontsCommand = FONTS_COMMAND;

  // The fonts and the faces as the library's SCSS declares them
  protected readonly fontFamily = otherProperties().find(property => property.name === '--twc-font-family')?.value ?? '';
  protected readonly lowDpiFontFamily = otherProperties().find(property => property.name === '--twc-low-dpi-font-family')?.value ?? '';
  protected readonly faces = fontFaces();
}
