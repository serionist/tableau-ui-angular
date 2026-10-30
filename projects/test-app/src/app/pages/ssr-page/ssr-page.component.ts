import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import appConfigServerTs from '../../app.config.server.ts?source' with { loader: 'text' };
import appRoutesServerTs from '../../app.routes.server.ts?source' with { loader: 'text' };
import { DocsCodeComponent } from '../../docs/docs-code.component';

@Component({
  selector: 'app-ssr-page',
  imports: [TableauUiCommonModule, DocsCodeComponent],
  templateUrl: './ssr-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsrPageComponent {
  // This site's own files, as the build reads them
  protected readonly appConfigServerTs = appConfigServerTs;
  protected readonly appRoutesServerTs = appRoutesServerTs;
}
