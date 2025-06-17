import { NgModule } from '@angular/core';
import { TooltipDirective } from './tooltip.directive';
import { TableauUiDialogModule } from 'tableau-ui-angular/dialog';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './tooltip.component';

@NgModule({
    imports: [TableauUiDialogModule, CommonModule],
    declarations: [TooltipDirective, TooltipComponent],
    exports: [TooltipDirective],
})
export class TableauUiTooltipModule {}
