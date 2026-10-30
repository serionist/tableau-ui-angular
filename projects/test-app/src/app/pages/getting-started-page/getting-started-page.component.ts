import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { engines } from '../../../../../../package.json';
import { peerDependencies, peerDependenciesMeta } from '../../../../../component-library/package.json';
import stylesScss from '../../../styles.scss?source' with { loader: 'text' };
import { DocsCodeComponent } from '../../docs/docs-code.component';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { GETTING_STARTED_EXAMPLES } from './getting-started.examples';
import { Icons } from './snippets/icons';
import iconsTs from './snippets/icons.ts?source' with { loader: 'text' };

@Component({
  selector: 'app-getting-started-page',
  imports: [TableauUiCommonModule, DocsCodeComponent, DocsExampleComponent],
  templateUrl: './getting-started-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GettingStartedPageComponent {
  protected readonly examples = GETTING_STARTED_EXAMPLES;

  // The peers and the Node range as the packages declare them
  protected readonly peers = Object.entries(peerDependencies).map(([name, range]) => ({
    name,
    range,
    optional: Object.keys(peerDependenciesMeta).includes(name),
  }));
  protected readonly node = engines.node;
  protected readonly monacoInstall = `npm install monaco-editor@${peerDependencies['monaco-editor']}`;

  // This site's own files, as the build reads them
  protected readonly stylesScss = stylesScss;
  protected readonly iconsTs = iconsTs;
  protected readonly iconCount = new Icons().getAllIcons().length;

  protected readonly fontsCommand = 'node node_modules/tableau-ui-angular/styles/fonts/downloadFonts.js https://your-tableau-server public/fonts';
  protected readonly iconsScripts = `{
  "scripts": {
    "icons": "node node_modules/tableau-ui-angular/used-icons/scripts/update-icons.js src/icons.ts public/icons",
    "prebuild": "npm run icons"
  }
}`;
}
