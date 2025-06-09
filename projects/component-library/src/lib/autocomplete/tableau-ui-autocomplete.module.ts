import { NgModule } from '@angular/core';
import { AutoCompleteComponent } from './autocomplete.component';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';
import { CommonModule } from '@angular/common';
import { TableauUiDialogModule } from '../dialogservice/tableau-ui-dialog.module';
import { AutoCompleteDirective } from './autocomplete.directive';

@NgModule({
    imports: [TableauUiCommonModule, CommonModule, TableauUiDialogModule],
    declarations: [AutoCompleteComponent, AutoCompleteDirective],
    exports: [AutoCompleteComponent, AutoCompleteDirective],
})
export class TableauUiAutoCompleteModule {}
