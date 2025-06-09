import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, debounceTime, startWith, Subject } from 'rxjs';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { ButtonMenuComponent, MenuButtonComponent, MenuButtonGroupComponent, MenuComponent, MenuDirective } from 'tableau-ui-angular/menu';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { importButton } from 'tableau-ui-angular/button/imports';
import { ImportDetailsComponent } from '../../components/import-details/import-details.component';
import { importButtonMenu, importMenu } from 'tableau-ui-angular/menu/imports';

@Component({
    selector: 'app-menu-page',
    imports: [...importSeparator(), ...importButton(), ImportDetailsComponent, ...importMenu(), ...importButtonMenu()],
    standalone: true,
    templateUrl: './menu-page.component.html',
    styleUrl: './menu-page.component.scss',
    providers: [importSnackProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent {
    snack = inject(SnackService);

    menuImport: ImportModel = {
        name: 'Menu',
        componentImports: [
            {
                name: 'MenuComponent',
                from: 'tableau-ui-angular/menu',
                info: 'Component for creating a dropdown menu',
            },
            {
                name: 'MenuDirective',
                from: 'tableau-ui-angular/menu',
                info: 'Directive for attaching the menu to a trigger element',
            },
        ],
        importFunctions: [
            {
                name: 'importMenu',
                from: 'tableau-ui-angular/menu/imports',
                info: 'Imports menu component and all its dependencies.',
            },
        ],
    };

    buttonMenuImport: ImportModel = {
        name: 'Button Menu',
        componentImports: [
            {
                name: 'ButtonMenuComponent',
                from: 'tableau-ui-angular/menu',
                info: 'Component for creating a button that opens a menu',
            },
            {
                name: 'MenuDirective',
                from: 'tableau-ui-angular/menu',
                info: 'Directive for attaching the menu to a trigger element',
            },

            {
                name: 'MenuButtonComponent',
                from: 'tableau-ui-angular/menu',
                info: 'Component for creating a button inside the menu',
            },
            {
                name: 'MenuButtonGroupComponent',
                from: 'tableau-ui-angular/menu',
                info: 'Component for grouping buttons inside the menu',
            },
        ],
        importFunctions: [
            {
                name: 'importButtonMenu',
                from: 'tableau-ui-angular/menu/imports',
                info: 'Imports button menu component and all its dependencies.',
            },
        ],
    };
}
