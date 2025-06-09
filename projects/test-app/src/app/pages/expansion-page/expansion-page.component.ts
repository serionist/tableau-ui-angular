import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { AccordionComponent, ExpansionPanelComponent, ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective } from 'tableau-ui-angular/expansion-panel';
import { importIcons } from 'tableau-ui-angular/icon/imports';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { importAccordion, importExpansionPanel } from 'tableau-ui-angular/expansion-panel/imports';
import { ImportDetailsComponent } from '../../components/import-details/import-details.component';

@Component({
    selector: 'app-buttons-page',
    imports: [...importSeparator(), ...importIcons(), importAccordion(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './expansion-page.component.html',
    styleUrl: './expansion-page.component.scss',
    providers: [...importSnackProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPageComponent {
    snack = inject(SnackService);

    singleImport: ImportModel = {
        name: 'Expansion Panel',
        componentImports: [
            {
                name: 'ExpansionPanelComponent',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Component for creating expandable panels with titles and content sections.',
            },
            {
                name: 'ExpansionPanelTitleComponent',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Component for defining the title of the expansion panel.',
            },
            {
                name: 'ExpansionPanelTitleCollapsedContentDirective',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Directive for defining the content shown when the panel is collapsed.',
            },
            {
                name: 'ExpansionPanelTitleExpandedContentDirective',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Directive for defining the content shown when the panel is expanded.',
            },
        ],
        importFunctions: [
            {
                name: 'importExpansionPanel',
                from: 'tableau-ui-angular/expansion-panel/imports',
                info: 'Imports expansion panel component and all its dependencies.',
            },
        ],
    };

    accordionImport: ImportModel = {
        name: 'Accordion',
        componentImports: [
            {
                name: 'AccordionComponent',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Component for creating an accordion layout with multiple expansion panels.',
            },
            {
                name: 'ExpansionPanelComponent',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Component for creating accordion panels with titles and content sections.',
            },
            {
                name: 'ExpansionPanelTitleComponent',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Component for defining the title of the accordion panel.',
            },
            {
                name: 'ExpansionPanelTitleCollapsedContentDirective',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Directive for defining the content shown when the accordion panel is collapsed.',
            },
            {
                name: 'ExpansionPanelTitleExpandedContentDirective',
                from: 'tableau-ui-angular/expansion-panel',
                info: 'Directive for defining the content shown when the accordion panel is expanded.',
            },
        ],
        importFunctions: [
            {
                name: 'importAccordion',
                from: 'tableau-ui-angular/expansion-panel/imports',
                info: 'Imports accordion component and all its dependencies.',
            },
        ],
    };

    specialButtonClick(e: Event) {
        e.stopPropagation();
        e.preventDefault();
        this.snack.openSnack('Button clicked', 5000);
    }
}
