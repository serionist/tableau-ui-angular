import { ChangeDetectionStrategy, Component } from '@angular/core';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { TooltipDirective } from 'tableau-ui-angular/tooltip';
import { importTooltip } from 'tableau-ui-angular/tooltip/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { ImportDetailsComponent } from "../../components/import-details/import-details.component";

@Component({
    selector: 'app-tooltips-page',
    imports: [...importSeparator(), TooltipDirective, ...importTooltip(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './tooltips-page.component.html',
    styleUrl: './tooltips-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipsPageComponent {
    imports: ImportModel = {
        name: 'Tooltip',
        providerImports: [
            {
                name: 'TooltipDirective',
                from: 'tableau-ui-angular/tooltip',
                info: 'Directive for creating tooltips on elements.',
            },
        ],
        providerImportFunctions: [
            {
                name: 'importTooltip',
                from: 'tableau-ui-angular/tooltip/imports',
                info: 'Imports the Tooltip directive.',
            },
        ],
    };
}
