import { NgModule } from '@angular/core';
import { ButtonComponent } from './button.component';
import { ButtonToggleComponent } from './button-toggle/button-toggle.component';
import { CommonModule } from '@angular/common';
import { TableauUiTooltipModule } from '../tooltip/tableau-ui-tooltip.module';

@NgModule({
    declarations: [ButtonComponent, ButtonToggleComponent],
    imports: [CommonModule, TableauUiTooltipModule],
    exports: [ButtonComponent, ButtonToggleComponent],
})
export class TableauUiButtonModule {}
