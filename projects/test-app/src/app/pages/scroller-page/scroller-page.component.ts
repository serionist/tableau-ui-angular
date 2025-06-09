import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ArrowScrollComponent } from 'tableau-ui-angular/arrow-scroll';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { IconComponent } from 'tableau-ui-angular/icon';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { importArrowScroll } from 'tableau-ui-angular/arrow-scroll/imports';
import { ImportDetailsComponent } from "../../components/import-details/import-details.component";

@Component({
    selector: 'app-scroller-page',
    imports: [importSeparator(), ...importArrowScroll(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './scroller-page.component.html',
    styleUrl: './scroller-page.component.scss',
    providers: [importSnackProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollerPageComponent {
    imports: ImportModel = {
        name: 'Scroller',
        componentImports: [
            {
                name: 'ArrowScrollComponent',
                from: 'tableau-ui-angular/arrow-scroll',
                info: 'Component for creating a scrollable area with arrow controls.',
            },
            {
                name: 'IconComponent',
                from: 'tableau-ui-angular/icon',
                info: 'Component for displaying scroller icons.',
            },
        ],
        importFunctions: [
            {
                name: 'importArrowScroll',
                from: 'tableau-ui-angular/arrow-scroll/imports',
                info: 'Imports scroller component and all its dependencies.',
            },
        ],
    }

}
