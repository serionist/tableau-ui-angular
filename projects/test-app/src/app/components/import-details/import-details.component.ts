import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ImportModel } from './import-model';
import { importSeparator } from 'tableau-ui-angular/common/imports';

@Component({
    selector: 'app-import-details',
    imports: [...importSeparator()],
    standalone: true,
    templateUrl: './import-details.component.html',
    styleUrl: './import-details.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportDetailsComponent {
    readonly $model = input.required<ImportModel>({
        alias: 'model',
    });
}
