import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiTabgroupModule } from 'tableau-ui-angular/tab-group';
import { DocsCodeComponent } from '../../docs/docs-code.component';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { CDK_INSTALL, DASHBOARD_EXAMPLES, ENHANCED_TABLE_FILES } from './dashboard.examples';

@Component({
  selector: 'app-dashboard-page',
  imports: [TableauUiCommonModule, TableauUiTabgroupModule, DocsCodeComponent, DocsExampleComponent],
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly examples = DASHBOARD_EXAMPLES;
  protected readonly tableFiles = ENHANCED_TABLE_FILES;
  protected readonly cdkInstall = CDK_INSTALL;
}
