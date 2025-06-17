import { NgModule } from '@angular/core';
import { ButtonComponent } from './button.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
    declarations: [ButtonComponent],
    exports: [ButtonComponent],
})
export class TableauUiButtonModule {}
