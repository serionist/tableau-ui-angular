import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MenuComponent } from './menu.component';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';
import { TableauUiDialogModule } from '../dialogservice/tableau-ui-dialog.module';
import { MenuDirective } from './menu.directive';
import { MenuButtonComponent } from './menu-button.component';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';
import { MenuButtonGroupComponent } from './menu-button-group.component';
import { ButtonMenuComponent } from './button.menu.component';
import { EntriesPipe } from './pipes/entries.pipe';

@NgModule({
    declarations: [MenuComponent, MenuDirective, MenuButtonComponent, MenuButtonGroupComponent, ButtonMenuComponent, EntriesPipe],
    imports: [CommonModule, TableauUiCommonModule, TableauUiDialogModule, TableauUiIconModule],
    exports: [MenuComponent, MenuDirective, MenuButtonComponent, MenuButtonGroupComponent, ButtonMenuComponent],
})
export class TableauUiMenuModule {}
