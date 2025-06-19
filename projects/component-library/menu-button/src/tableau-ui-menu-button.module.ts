import { NgModule } from '@angular/core';
import { MenuButtonComponent } from './menu-button.component';
import { MenuButtonGroupComponent } from './menu-button-group.component';
import { EntriesPipe } from './pipes/entries.pipe';
import { CommonModule } from '@angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiUtilsModule } from 'tableau-ui-angular/utils';
import { ButtonMenuDirective } from './button-menu.directive';

@NgModule({
    imports: [CommonModule, TableauUiIconModule, TableauUiUtilsModule],
    declarations: [MenuButtonComponent, MenuButtonGroupComponent, ButtonMenuDirective, EntriesPipe],
    exports: [MenuButtonComponent, MenuButtonGroupComponent, ButtonMenuDirective],
})
export class TableauUiMenuButtonModule {}
