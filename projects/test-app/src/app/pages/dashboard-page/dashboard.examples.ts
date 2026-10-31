import type { DocsExample, DocsFile } from '../../docs/docs-example';
import tableHtml from './examples/enhanced-table.component.html?source' with { loader: 'text' };
import tableScss from './examples/enhanced-table.component.scss?source' with { loader: 'text' };
import tableTs from './examples/enhanced-table.component.ts?source' with { loader: 'text' };
import { SalesDashboardExampleComponent } from './examples/sales-dashboard.example';
import dashboardHtml from './examples/sales-dashboard.example.html?source' with { loader: 'text' };
import dashboardScss from './examples/sales-dashboard.example.scss?source' with { loader: 'text' };
import dashboardTs from './examples/sales-dashboard.example.ts?source' with { loader: 'text' };

// The dashboard page's sample, with the text of its files
export const DASHBOARD_EXAMPLES = {
  dashboard: { component: SalesDashboardExampleComponent, ts: dashboardTs, html: dashboardHtml, scss: dashboardScss },
} satisfies Record<string, DocsExample>;

// The files of the enhanced table, which the dashboard imports from its folder: the page shows each one
export const ENHANCED_TABLE_FILES: DocsFile[] = [
  { label: 'enhanced-table.component.ts', source: tableTs },
  { label: 'enhanced-table.component.html', source: tableHtml },
  { label: 'enhanced-table.component.scss', source: tableScss },
];

// The command that installs what the enhanced table moves columns with, at the Angular major the library's peers name:
// the latest would be a CDK for a later Angular
export const CDK_INSTALL = 'npm install @angular/cdk@22';
