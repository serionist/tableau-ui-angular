import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsCodeComponent } from '../../docs/docs-code.component';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { ICONS_EXAMPLES } from './icons.examples';
import { ICONS_CLASS, ICONS_CSS_API, ICONS_CSS_FILE, ICONS_CSS_URL_VARIABLE, ICONS_CSS_USE, ICONS_SCRIPTS, ICONS_TOOLS_INSTALL, MATERIAL_SYMBOLS_INSTALL, MATERIAL_SYMBOLS_USES } from './setup';
import { Icons } from './snippets/icons';
import iconsTs from './snippets/icons.ts?source' with { loader: 'text' };

@Component({
  selector: 'app-icons-page',
  imports: [TableauUiCommonModule, DocsCodeComponent, DocsExampleComponent],
  templateUrl: './icons-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconsPageComponent {
  protected readonly examples = ICONS_EXAMPLES;

  protected readonly iconsTs = iconsTs;
  protected readonly iconsClass = ICONS_CLASS;
  // What the list above downloads: its icons with the library's own, in its fonts
  protected readonly iconCount = new Icons().getAllIcons().length;
  protected readonly fontCount = new Icons().fonts.length;

  protected readonly iconsScripts = ICONS_SCRIPTS;
  protected readonly toolsInstall = ICONS_TOOLS_INSTALL;
  protected readonly cssUse = ICONS_CSS_USE;
  protected readonly cssFile = ICONS_CSS_FILE;
  protected readonly cssUrlVariable = ICONS_CSS_URL_VARIABLE;
  protected readonly cssApi = ICONS_CSS_API;

  protected readonly packageInstall = MATERIAL_SYMBOLS_INSTALL;
  protected readonly packageUses = MATERIAL_SYMBOLS_USES.join('\n');
}
