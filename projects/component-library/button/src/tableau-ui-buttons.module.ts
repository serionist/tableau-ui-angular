import { NgModule } from '@angular/core';
import { ButtonComponent } from './button.component';
import { ButtonToggleComponent } from './button-toggle/button-toggle.component';
import { CommonModule } from '@angular/common';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';

@NgModule({
    imports: [CommonModule, TableauUiTooltipModule, TableauUiCommonModule],
    declarations: [ButtonComponent, ButtonToggleComponent],
    exports: [ButtonComponent, ButtonToggleComponent],
})
export class TableauUiButtonModule {}
