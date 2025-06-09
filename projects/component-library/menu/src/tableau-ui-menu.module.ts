import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MenuComponent } from './menu.component';
import { MenuDirective } from './menu.directive';
import { MenuButtonComponent } from './menu-button.component';
import { MenuButtonGroupComponent } from './menu-button-group.component';
import { ButtonMenuComponent } from './button.menu.component';
import { EntriesPipe } from './pipes/entries.pipe';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiDialogModule } from 'tableau-ui-angular/dialog';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiUtilsModule } from 'tableau-ui-angular/utils';

@NgModule({
    imports: [CommonModule, TableauUiCommonModule, TableauUiDialogModule, TableauUiIconModule, TableauUiUtilsModule],
    declarations: [MenuComponent, MenuDirective, MenuButtonComponent, MenuButtonGroupComponent, ButtonMenuComponent, EntriesPipe],
    exports: [MenuComponent, MenuDirective, MenuButtonComponent, MenuButtonGroupComponent, ButtonMenuComponent],
})
export class TableauUiMenuModule {}
