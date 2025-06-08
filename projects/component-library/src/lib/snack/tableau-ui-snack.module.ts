import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';
import { SnackComponent } from './snack.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [SnackComponent],
    imports: [CommonModule, TableauUiIconModule, RouterModule],
    exports: [],
})
export class TableauUiSnackModule {}
