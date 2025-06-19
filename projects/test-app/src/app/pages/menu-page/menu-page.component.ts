import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';
import { TableauUiMenuButtonModule } from 'tableau-ui-angular/menu-button';
import { SnackService, TableauUiSnackModule } from 'tableau-ui-angular/snack';

@Component({
    selector: 'app-menu-page',
    imports: [TableauUiSnackModule, TableauUiCommonModule, TableauUiMenuModule, TableauUiButtonModule, TableauUiMenuButtonModule],
    standalone: true,
    templateUrl: './menu-page.component.html',
    styleUrl: './menu-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent {
    snack = inject(SnackService);
}
