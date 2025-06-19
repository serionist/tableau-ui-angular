import { NgModule } from '@angular/core';
import { MenuButtonComponent } from './menu-button.component';
import { MenuButtonGroupComponent } from './menu-button-group.component';
import { EntriesPipe } from './pipes/entries.pipe';
import { CommonModule } from '@angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiUtilsModule } from 'tableau-ui-angular/utils';

@NgModule({
    imports: [CommonModule, TableauUiIconModule, TableauUiUtilsModule],
    declarations: [MenuButtonComponent, MenuButtonGroupComponent, EntriesPipe],
    exports: [MenuButtonComponent, MenuButtonGroupComponent],
})
export class TableauUiMenuButtonModule {}
