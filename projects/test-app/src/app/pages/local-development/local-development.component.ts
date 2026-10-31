import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsCodeComponent } from '../../docs/docs-code.component';
import { ANGULAR_JSON, DEV_LINK, LINK_COMMAND, LINK_INSTALL, TSCONFIG_JSON, UNLINK } from './link-steps';

@Component({
  selector: 'app-local-development',
  imports: [TableauUiCommonModule, DocsCodeComponent],
  templateUrl: './local-development.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalDevelopmentComponent {
  protected readonly devLink = DEV_LINK;
  protected readonly angularJson = ANGULAR_JSON;
  protected readonly tsconfigJson = TSCONFIG_JSON;
  protected readonly linkInstall = LINK_INSTALL;
  protected readonly linkCommand = LINK_COMMAND;
  protected readonly unlink = UNLINK;
}
