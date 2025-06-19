import { NgModule } from '@angular/core';
import { TableauUiDialogModule } from 'tableau-ui-angular/dialog';
import { MenuDirective } from './menu.directive';
import { AttachedMenuDirective } from './attached-menu.directive';
import { ButtonMenuDirective } from './button-menu.directive';

@NgModule({
    imports: [TableauUiDialogModule],
    declarations: [MenuDirective, AttachedMenuDirective, ButtonMenuDirective],
    exports: [MenuDirective, AttachedMenuDirective, ButtonMenuDirective],
})
export class TableauUiMenuModule {}
