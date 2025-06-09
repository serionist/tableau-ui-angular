import { ChangeDetectionStrategy, Component } from '@angular/core';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { TabComponent, TabGroupComponent } from 'tableau-ui-angular/tab-group';
import { importTabGroup } from 'tableau-ui-angular/tab-group/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { ImportDetailsComponent } from '../../components/import-details/import-details.component';

@Component({
    selector: 'app-tabcontrol-page',
    imports: [...importSeparator(), TabGroupComponent, TabComponent, ...importTabGroup(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './tabcontrol-page.component.html',
    styleUrl: './tabcontrol-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabcontrolPageComponent {
    imports: ImportModel = {
        name: 'TabControl',
        providerImports: [
            {
                name: 'TabGroupComponent',
                from: 'tableau-ui-angular/tab-group',
                info: 'Component for creating tab groups.',
            },
            {
                name: 'TabComponent',
                from: 'tableau-ui-angular/tab-group',
                info: 'Component for individual tabs within a tab group.',
            },
        ],
        providerImportFunctions: [
            {
                name: 'importTabGroup',
                from: 'tableau-ui-angular/tab-group/imports',
                info: 'Imports the TabGroup and Tab components.',
            },
        ],
    };
}
