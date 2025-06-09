import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';
import { SnackComponent } from './snack.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [CommonModule, TableauUiIconModule, RouterModule],
    declarations: [SnackComponent],
    exports: [],
})
export class TableauUiSnackModule {}
