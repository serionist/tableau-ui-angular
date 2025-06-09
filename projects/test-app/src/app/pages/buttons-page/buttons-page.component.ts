import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core';
import { importAllButtons, importButton, importButtonToggle } from 'tableau-ui-angular/button/imports';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { importIcons } from 'tableau-ui-angular/icon/imports';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { ImportDetailsComponent } from "../../components/import-details/import-details.component";

@Component({
    selector: 'app-buttons-page',
    imports: [...importSeparator(), ...importAllButtons(), ...importIcons(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './buttons-page.component.html',
    styleUrl: './buttons-page.component.scss',
    providers: [importSnackProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
export class ButtonsPageComponent {
    snack = inject(SnackService);

    buttonsImport: ImportModel = {
        name: 'Button',
        componentImports: [
            {
                name: 'ButtonComponent',
                from: 'tableau-ui-angular/button',
            }
        ],
        importFunctions: [
            {
                name: 'importButton',
                from: 'tableau-ui-angular/button/imports',
                info: 'Imports button component and all its dependencies.'
            }
        ]
    };

    toggleButtonsImport: ImportModel = {
        name: 'Toggle Button',
        componentImports: [
            {
                name: 'ButtonToggleComponent',
                from: 'tableau-ui-angular/button',
            }
        ],
        importFunctions: [
            {
                name: 'importButtonToggle',
                from: 'tableau-ui-angular/button/imports',
                info: 'Imports button toggle component and all its dependencies.'
            }
        ]
    };
    allButtons: ImportModel = {
        name: 'All Buttons',
        componentImports: [
            {
                name: 'ButtonComponent',
                from: 'tableau-ui-angular/button',
            },
            {
                name: 'ButtonToggleComponent',
                from: 'tableau-ui-angular/button',
            }
        ],
        importFunctions: [
            {
                name: 'importAllButtons',
                from: 'tableau-ui-angular/button/imports',
                info: 'Imports all button components and all their dependencies.'
            }
        ]
    };

    buttonsLoading = {
        primary: false,
        secondary: false,
        error: false,
        plain: false,
    };
    async buttonClick(color: 'error' | 'plain' | 'primary' | 'secondary') {
        this.buttonsLoading[color] = true;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.buttonsLoading[color] = false;
        console.log('Button clicked', color);
        this.snack.openSnack(`Button ${color} clicked`, 2000, color === 'error' ? 'error' : 'info');
    }

    readonly buttonToggleValue = model<string | undefined>('center');
    private initialButtonToggleValueChange = true;
    readonly buttonToggleChange = effect(() => {
        const val = this.buttonToggleValue();
        if (this.initialButtonToggleValueChange) {
            this.initialButtonToggleValueChange = false;
            return;
        }

        this.snack.openSnack('Button toggle value changed: ' + (val ?? '[undefined]'), 2000, 'info');
    });
}
