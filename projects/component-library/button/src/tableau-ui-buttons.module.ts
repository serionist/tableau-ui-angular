import { NgModule } from '@angular/core';
import { ButtonComponent } from './button.component';
import { ButtonToggleComponent } from './button-toggle/button-toggle.component';
import { CommonModule } from '@angular/common';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';

@NgModule({
    imports: [CommonModule, TableauUiTooltipModule],
    declarations: [ButtonComponent, ButtonToggleComponent],
    exports: [ButtonComponent, ButtonToggleComponent],
})
export class TableauUiButtonModule {}
