import { NgModule } from '@angular/core';
import { TableauUiDialogModule } from 'tableau-ui-angular/dialog';
import { MenuDirective } from './menu.directive';
import { AttachedMenuDirective } from './attached-menu.directive';

@NgModule({
    imports: [TableauUiDialogModule],
    declarations: [MenuDirective, AttachedMenuDirective],
    exports: [MenuDirective, AttachedMenuDirective],
})
export class TableauUiMenuModule {}
