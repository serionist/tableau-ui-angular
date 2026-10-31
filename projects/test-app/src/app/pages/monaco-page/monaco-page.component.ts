import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { peerDependencies } from '../../../../../component-library/package.json';
import { DocsCodeComponent } from '../../docs/docs-code.component';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { MONACO_EXAMPLES } from './monaco.examples';
import { MONACO_ASSETS } from './setup';

@Component({
  selector: 'app-monaco-page',
  imports: [TableauUiCommonModule, DocsCodeComponent, DocsExampleComponent],
  templateUrl: './monaco-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonacoPageComponent {
  protected readonly examples = MONACO_EXAMPLES;

  // The peer's range as the package declares it
  protected readonly install = `npm install monaco-editor@${peerDependencies['monaco-editor']}`;
  protected readonly assets = MONACO_ASSETS;
}
